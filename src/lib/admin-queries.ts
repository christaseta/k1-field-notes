import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedbackKind, Seller, Submission } from "@/lib/db-types";
import { PROGRAM_NAME, PROGRAM_START_DATE, PROGRAM_WEEKS } from "@/lib/program";
import {
  dailyQuestionSet,
  weeklyQuestionSets,
  type Question as AuthoredQuestion,
} from "@/lib/questions";

export type SubmissionWithSeller = Submission & {
  seller: Pick<Seller, "id" | "email" | "display_name"> | null;
};

export type ListSubmissionsParams = {
  kind?: FeedbackKind;
  sellerId?: string;
  tag?: string;
  from?: string; // ISO date
  to?: string; // ISO date
  limit?: number;
  offset?: number;
};

export async function listSubmissions(
  params: ListSubmissionsParams = {},
): Promise<{ rows: SubmissionWithSeller[]; total: number }> {
  const supabase = createAdminClient();
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  let query = supabase
    .from("submissions")
    .select(
      "id, seller_id, kind, question_set_id, answers, note, tags, submitted_at, seller:sellers(id, email, display_name)",
      { count: "exact" },
    )
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.kind) query = query.eq("kind", params.kind);
  if (params.sellerId) query = query.eq("seller_id", params.sellerId);
  if (params.tag) query = query.contains("tags", [params.tag]);
  if (params.from) query = query.gte("submitted_at", params.from);
  if (params.to) query = query.lte("submitted_at", params.to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    rows: (data ?? []) as unknown as SubmissionWithSeller[],
    total: count ?? 0,
  };
}

export async function getSubmission(
  id: string,
): Promise<SubmissionWithSeller | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, seller_id, kind, question_set_id, answers, note, tags, submitted_at, seller:sellers(id, email, display_name, weekly_day_pref, timezone, created_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as SubmissionWithSeller) ?? null;
}

export type SellerWithCounts = Seller & { submission_count: number };

export async function listSellers(): Promise<SellerWithCounts[]> {
  const supabase = createAdminClient();
  const { data: sellers, error } = await supabase
    .from("sellers")
    .select("id, email, display_name, weekly_day_pref, timezone, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: counts, error: countsError } = await supabase
    .from("submissions")
    .select("seller_id");
  if (countsError) throw countsError;

  const countBySeller = new Map<string, number>();
  for (const row of counts ?? []) {
    const id = (row as { seller_id: string }).seller_id;
    countBySeller.set(id, (countBySeller.get(id) ?? 0) + 1);
  }

  return (sellers ?? []).map((s) => ({
    ...(s as Seller),
    submission_count: countBySeller.get((s as Seller).id) ?? 0,
  }));
}

export type StudyWeek = {
  id: string;
  label: string;
  dates: string;
  startISO: string;
  endISO: string;
};

export type StudyOverview = {
  study: {
    name: string;
    weeks: number;
    participants: number;
    entries: number;
    responseRate: number;
    flagged: number;
  };
  weeks: StudyWeek[];
  participants: { id: string; name: string; initials: string }[];
};

export type Spotlight = {
  submissionId: string;
  sellerId: string;
  sellerName: string;
  sellerInitials: string;
  questionId: string | null;
  questionPrompt: string | null;
  text: string;
  flagged: boolean;
};

export type CompareQuestion = {
  id: string;
  kind: "MC" | "OPEN";
  prompt: string;
  choices?: { value: string; label: string }[];
  source: "daily" | "weekly" | "spontaneous";
};

export type CompareResponse = {
  submissionId: string;
  sellerId: string;
  sellerName: string;
  sellerInitials: string;
  weekId: string;
  weekShort: string;
  text: string | null;
  choiceValue: string | null;
  choiceLabel: string | null;
  flagged: boolean;
};

export type QuestionCompareData = {
  questions: CompareQuestion[];
  /** dist[questionId][weekId][choiceValue] = count */
  dist: Record<string, Record<string, Record<string, number>>>;
  /** responses[questionId] = list of seller-level responses */
  responses: Record<string, CompareResponse[]>;
};

export type WeekDigest = {
  weekId: string;
  responding: number;
  entries: number;
  flagged: number;
  themes: { label: string; count: number }[];
  spotlights: Spotlight[];
};

const FLAGGED_TAGS = new Set(["Friction", "Bug"]);

function buildProgramWeeks(): StudyWeek[] {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return Array.from({ length: PROGRAM_WEEKS }, (_, i) => {
    const start = new Date(PROGRAM_START_DATE.getTime() + i * 7 * DAY_MS);
    const end = new Date(start.getTime() + 6 * DAY_MS);
    return {
      id: `W${i + 1}`,
      label: `Week ${i + 1}`,
      dates: `${fmt.format(start)}–${fmt.format(end).replace(/^[A-Za-z]+ /, (m) => (start.getMonth() === end.getMonth() ? "" : m))}`,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    };
  });
}

export async function getStudyOverview(): Promise<StudyOverview> {
  const supabase = createAdminClient();
  const weeks = buildProgramWeeks();
  const programStartISO = weeks[0].startISO;
  const programEndISO = new Date(
    new Date(weeks[weeks.length - 1].endISO).getTime() + 24 * 60 * 60 * 1000 - 1,
  ).toISOString();

  const [sellersRows, { count: entries }, distinct, flaggedRows] = await Promise.all([
    supabase.from("sellers").select("id, email, display_name"),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", programStartISO)
      .lte("submitted_at", programEndISO),
    supabase
      .from("submissions")
      .select("seller_id")
      .gte("submitted_at", programStartISO)
      .lte("submitted_at", programEndISO),
    supabase
      .from("submissions")
      .select("tags")
      .gte("submitted_at", programStartISO)
      .lte("submitted_at", programEndISO),
  ]);

  const respondingSellers = new Set<string>();
  for (const row of distinct.data ?? []) {
    respondingSellers.add((row as { seller_id: string }).seller_id);
  }
  const sellerList = (sellersRows.data ?? []) as { id: string; email: string; display_name: string | null }[];
  const participantCount = sellerList.length;
  const responseRate =
    participantCount > 0 ? respondingSellers.size / participantCount : 0;

  let flagged = 0;
  for (const row of flaggedRows.data ?? []) {
    const tags = (row as { tags: string[] | null }).tags ?? [];
    if (tags.some((t) => FLAGGED_TAGS.has(t))) flagged++;
  }

  const participantList = sellerList
    .map((s) => ({
      id: s.id,
      name: displayNameFor(s),
      initials: initialsFor(s),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    study: {
      name: PROGRAM_NAME,
      weeks: PROGRAM_WEEKS,
      participants: participantCount,
      entries: entries ?? 0,
      responseRate,
      flagged,
    },
    weeks,
    participants: participantList,
  };
}

function initialsFor(seller: { display_name: string | null; email: string }): string {
  const source = seller.display_name?.trim() || seller.email.split("@")[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function displayNameFor(seller: { display_name: string | null; email: string }): string {
  return seller.display_name?.trim() || seller.email.split("@")[0];
}

export async function getWeeklyDigests(weeks: StudyWeek[]): Promise<WeekDigest[]> {
  const supabase = createAdminClient();
  const startISO = weeks[0].startISO;
  const endISO = new Date(
    new Date(weeks[weeks.length - 1].endISO).getTime() + 24 * 60 * 60 * 1000 - 1,
  ).toISOString();

  const { data: subs } = await supabase
    .from("submissions")
    .select("id, seller_id, kind, answers, note, tags, submitted_at")
    .gte("submitted_at", startISO)
    .lte("submitted_at", endISO)
    .order("submitted_at", { ascending: false });

  const sellerIds = Array.from(
    new Set((subs ?? []).map((s) => (s as { seller_id: string }).seller_id)),
  );
  const { data: sellers } = sellerIds.length
    ? await supabase
        .from("sellers")
        .select("id, email, display_name")
        .in("id", sellerIds)
    : { data: [] };
  const sellerMap = new Map<string, { id: string; email: string; display_name: string | null }>();
  for (const s of sellers ?? []) {
    sellerMap.set((s as { id: string }).id, s as { id: string; email: string; display_name: string | null });
  }

  const weekStart = weeks.map((w) => new Date(w.startISO).getTime());
  const weekEnd = weeks.map((w) => new Date(w.endISO).getTime() + 24 * 60 * 60 * 1000 - 1);
  const findWeekIdx = (ts: number) => {
    for (let i = 0; i < weeks.length; i++) {
      if (ts >= weekStart[i] && ts <= weekEnd[i]) return i;
    }
    return -1;
  };

  const buckets: WeekDigest[] = weeks.map((w) => ({
    weekId: w.id,
    responding: 0,
    entries: 0,
    flagged: 0,
    themes: [],
    spotlights: [],
  }));
  const respondingPerWeek: Set<string>[] = weeks.map(() => new Set());
  const tagCounts: Map<string, number>[] = weeks.map(() => new Map());
  const candidatesPerWeek: Submission[][] = weeks.map(() => []);

  for (const raw of subs ?? []) {
    const sub = raw as unknown as Submission;
    const idx = findWeekIdx(new Date(sub.submitted_at).getTime());
    if (idx < 0) continue;
    buckets[idx].entries += 1;
    respondingPerWeek[idx].add(sub.seller_id);
    const tags = sub.tags ?? [];
    const flagged = tags.some((t) => FLAGGED_TAGS.has(t));
    if (flagged) buckets[idx].flagged += 1;
    for (const t of tags) {
      tagCounts[idx].set(t, (tagCounts[idx].get(t) ?? 0) + 1);
    }
    const hasText =
      (sub.note && sub.note.trim().length > 0) ||
      sub.answers?.some(
        (a) => a.type === "open" && typeof a.answer === "string" && a.answer.trim().length > 0,
      );
    if (hasText) candidatesPerWeek[idx].push(sub);
  }

  for (let i = 0; i < weeks.length; i++) {
    buckets[i].responding = respondingPerWeek[i].size;
    buckets[i].themes = Array.from(tagCounts[i].entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const top = candidatesPerWeek[i].slice(0, 12);
    buckets[i].spotlights = top.map((sub) => {
      const seller = sellerMap.get(sub.seller_id);
      const openAnswer = sub.answers?.find(
        (a) => a.type === "open" && typeof a.answer === "string" && a.answer.trim().length > 0,
      );
      const text = sub.note?.trim() || openAnswer?.answer || "";
      const tags = sub.tags ?? [];
      return {
        submissionId: sub.id,
        sellerId: sub.seller_id,
        sellerName: seller ? displayNameFor(seller) : "Unknown",
        sellerInitials: seller ? initialsFor(seller) : "?",
        questionId: openAnswer?.question_id ?? null,
        questionPrompt: openAnswer?.prompt ?? (sub.note ? "Spontaneous note" : null),
        text,
        flagged: tags.some((t) => FLAGGED_TAGS.has(t)),
      };
    });
  }

  return buckets;
}

function buildAuthoredQuestions(): CompareQuestion[] {
  const seen = new Set<string>();
  const out: CompareQuestion[] = [];
  const push = (q: AuthoredQuestion, source: "daily" | "weekly") => {
    if (seen.has(q.id)) return;
    seen.add(q.id);
    out.push({
      id: q.id,
      kind: q.type === "multiple_choice" ? "MC" : "OPEN",
      prompt: q.prompt,
      choices: q.type === "multiple_choice" ? q.choices : undefined,
      source,
    });
  };
  for (const q of dailyQuestionSet.questions) push(q, "daily");
  for (const set of weeklyQuestionSets) {
    for (const q of set.questions) push(q, "weekly");
  }
  out.push({
    id: "__spontaneous__",
    kind: "OPEN",
    prompt: "Spontaneous notes",
    source: "spontaneous",
  });
  return out;
}

export async function getQuestionCompareData(
  weeks: StudyWeek[],
): Promise<QuestionCompareData> {
  const supabase = createAdminClient();
  const startISO = weeks[0].startISO;
  const endISO = new Date(
    new Date(weeks[weeks.length - 1].endISO).getTime() + 24 * 60 * 60 * 1000 - 1,
  ).toISOString();

  const { data: subs } = await supabase
    .from("submissions")
    .select("id, seller_id, kind, answers, note, tags, submitted_at")
    .gte("submitted_at", startISO)
    .lte("submitted_at", endISO)
    .order("submitted_at", { ascending: false });

  const sellerIds = Array.from(
    new Set((subs ?? []).map((s) => (s as { seller_id: string }).seller_id)),
  );
  const { data: sellers } = sellerIds.length
    ? await supabase
        .from("sellers")
        .select("id, email, display_name")
        .in("id", sellerIds)
    : { data: [] };
  const sellerMap = new Map<string, { id: string; email: string; display_name: string | null }>();
  for (const s of sellers ?? []) {
    sellerMap.set((s as { id: string }).id, s as { id: string; email: string; display_name: string | null });
  }

  const weekStart = weeks.map((w) => new Date(w.startISO).getTime());
  const weekEnd = weeks.map((w) => new Date(w.endISO).getTime() + 24 * 60 * 60 * 1000 - 1);
  const findWeekIdx = (ts: number) => {
    for (let i = 0; i < weeks.length; i++) {
      if (ts >= weekStart[i] && ts <= weekEnd[i]) return i;
    }
    return -1;
  };
  const shortFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

  const questions = buildAuthoredQuestions();
  const choiceLabel: Record<string, Record<string, string>> = {};
  for (const q of questions) {
    if (q.choices) {
      choiceLabel[q.id] = Object.fromEntries(q.choices.map((c) => [c.value, c.label]));
    }
  }

  const dist: Record<string, Record<string, Record<string, number>>> = {};
  const responses: Record<string, CompareResponse[]> = {};
  for (const q of questions) {
    dist[q.id] = {};
    responses[q.id] = [];
    for (const w of weeks) dist[q.id][w.id] = {};
  }

  for (const raw of subs ?? []) {
    const sub = raw as unknown as Submission;
    const idx = findWeekIdx(new Date(sub.submitted_at).getTime());
    if (idx < 0) continue;
    const week = weeks[idx];
    const seller = sellerMap.get(sub.seller_id);
    const sellerName = seller ? displayNameFor(seller) : "Unknown";
    const sellerInitials = seller ? initialsFor(seller) : "?";
    const flagged = (sub.tags ?? []).some((t) => FLAGGED_TAGS.has(t));
    const weekShort = shortFmt.format(new Date(sub.submitted_at));

    if (sub.kind === "spontaneous" && sub.note?.trim()) {
      responses["__spontaneous__"].push({
        submissionId: sub.id,
        sellerId: sub.seller_id,
        sellerName,
        sellerInitials,
        weekId: week.id,
        weekShort,
        text: sub.note.trim(),
        choiceValue: null,
        choiceLabel: null,
        flagged,
      });
      continue;
    }

    for (const ans of sub.answers ?? []) {
      if (!dist[ans.question_id]) continue;
      if (ans.type === "multiple_choice" && ans.answer) {
        const bucket = dist[ans.question_id][week.id];
        bucket[ans.answer] = (bucket[ans.answer] ?? 0) + 1;
        responses[ans.question_id].push({
          submissionId: sub.id,
          sellerId: sub.seller_id,
          sellerName,
          sellerInitials,
          weekId: week.id,
          weekShort,
          text: null,
          choiceValue: ans.answer,
          choiceLabel: choiceLabel[ans.question_id]?.[ans.answer] ?? ans.answer,
          flagged,
        });
      } else if (ans.type === "open" && ans.answer?.trim()) {
        responses[ans.question_id].push({
          submissionId: sub.id,
          sellerId: sub.seller_id,
          sellerName,
          sellerInitials,
          weekId: week.id,
          weekShort,
          text: ans.answer.trim(),
          choiceValue: null,
          choiceLabel: null,
          flagged,
        });
      }
    }
  }

  return { questions, dist, responses };
}

export async function getOverviewStats() {
  const supabase = createAdminClient();
  const [{ count: total }, { count: dailyCount }, { count: weeklyCount }, { count: spontaneousCount }, { count: sellerCount }] =
    await Promise.all([
      supabase.from("submissions").select("*", { count: "exact", head: true }),
      supabase.from("submissions").select("*", { count: "exact", head: true }).eq("kind", "daily"),
      supabase.from("submissions").select("*", { count: "exact", head: true }).eq("kind", "weekly"),
      supabase.from("submissions").select("*", { count: "exact", head: true }).eq("kind", "spontaneous"),
      supabase.from("sellers").select("*", { count: "exact", head: true }),
    ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: last7 } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("submitted_at", sevenDaysAgo.toISOString());

  return {
    totalSubmissions: total ?? 0,
    daily: dailyCount ?? 0,
    weekly: weeklyCount ?? 0,
    spontaneous: spontaneousCount ?? 0,
    sellers: sellerCount ?? 0,
    last7Days: last7 ?? 0,
  };
}

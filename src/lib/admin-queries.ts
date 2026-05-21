import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedbackKind, Seller, Submission } from "@/lib/db-types";

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

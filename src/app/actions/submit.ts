"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  dailyQuestionSet,
  currentWeeklySet,
  type Question,
} from "@/lib/questions";
import type { FeedbackKind, StoredAnswer } from "@/lib/db-types";

type SubmitInput = {
  kind: FeedbackKind;
  // For daily/weekly: { questionId: answerString }
  answers?: Record<string, string>;
  // Per-question input method, sent from the client. Default "text".
  inputMethods?: Record<string, "voice" | "text" | "choice">;
  // Spontaneous freeform note.
  note?: string;
  noteInputMethod?: "voice" | "text";
  // Spontaneous-only — research-defined topic tags.
  tags?: string[];
  // Photo URLs uploaded to the submission-media bucket; spontaneous-only for now.
  mediaUrls?: string[];
};

export async function submitFeedback(input: SubmitInput) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo")?.value === "true";
  
  // In demo mode, skip the actual submission but return success
  if (isDemo) {
    return;
  }
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let questionSetId: string | null = null;
  const stored: StoredAnswer[] = [];
  let note: string | null = null;

  if (input.kind === "daily" || input.kind === "weekly") {
    const set =
      input.kind === "daily" ? dailyQuestionSet : currentWeeklySet();
    questionSetId = set.id;

    for (const q of set.questions) {
      if (!isQuestionVisible(q, input.answers ?? {})) continue;
      const answer = input.answers?.[q.id]?.trim() ?? "";
      stored.push({
        question_id: q.id,
        prompt: q.prompt,
        type: q.type,
        answer: answer || null,
        input_method:
          input.inputMethods?.[q.id] ??
          (q.type === "multiple_choice" ? "choice" : "text"),
      });
    }
  } else {
    note = (input.note ?? "").trim();
    if (!note) throw new Error("Spontaneous note cannot be empty");
  }

  const tags = (input.tags ?? [])
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const mediaUrls = Array.isArray(input.mediaUrls)
    ? input.mediaUrls.filter((u) => typeof u === "string" && u.length > 0)
    : [];

  const { error } = await supabase.from("submissions").insert({
    seller_id: user.id,
    kind: input.kind,
    question_set_id: questionSetId,
    answers: stored,
    note,
    tags,
    media_urls: mediaUrls,
  });

  if (error) throw new Error(error.message);
}

function isQuestionVisible(
  q: Question,
  answers: Record<string, string>,
): boolean {
  if (!q.showWhen) return true;
  const parent = answers[q.showWhen.questionId];
  return parent ? q.showWhen.whenAnswerIn.includes(parent) : false;
}

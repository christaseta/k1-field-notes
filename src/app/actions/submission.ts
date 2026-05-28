"use server";

import { getSubmission } from "@/lib/admin-queries";

export type SubmissionDetailResult =
  | { ok: true; submission: NonNullable<Awaited<ReturnType<typeof getSubmission>>> }
  | { ok: false; error: string };

export async function fetchSubmissionDetail(
  id: string,
): Promise<SubmissionDetailResult> {
  if (!id || typeof id !== "string") {
    return { ok: false, error: "Invalid submission id." };
  }
  const submission = await getSubmission(id);
  if (!submission) return { ok: false, error: "Submission not found." };
  return { ok: true, submission };
}

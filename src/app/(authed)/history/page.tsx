import { createClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/db-types";
import { TitleBar } from "@/components/TitleBar";

const KIND_LABEL: Record<Submission["kind"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  spontaneous: "Note",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("submissions")
    .select("id, kind, submitted_at, note, answers, question_set_id")
    .order("submitted_at", { ascending: false })
    .limit(50);

  const submissions = (rows ?? []) as Submission[];

  return (
    <>
      <TitleBar title="Your notes" backHref="/home" />
      <div className="max-w-md w-full mx-auto px-4 pt-6 space-y-6">

      {submissions.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 text-center">
          <p className="text-[14px] text-[var(--text-subtle)]">
            Nothing here yet. Your daily, weekly, and spontaneous notes will
            show up here once you submit them.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li
              key={s.id}
              className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] tracking-wider uppercase text-[var(--text-subtle)] font-medium">
                  {KIND_LABEL[s.kind]}
                </span>
                <time className="text-[12px] text-[var(--text-disabled)]">
                  {formatDate(s.submitted_at)}
                </time>
              </div>
              <Preview submission={s} />
            </li>
          ))}
        </ul>
      )}
      </div>
    </>
  );
}

function Preview({ submission }: { submission: Submission }) {
  if (submission.kind === "spontaneous") {
    return (
      <p className="text-[14px] text-[var(--text-standard)] leading-snug line-clamp-3">
        {submission.note}
      </p>
    );
  }
  const first = submission.answers[0];
  if (!first) {
    return (
      <p className="text-[12px] text-[var(--text-disabled)]">
        Submitted (no answers).
      </p>
    );
  }
  return (
    <div className="space-y-1">
      <p className="text-[13px] text-[var(--text-subtle)]">{first.prompt}</p>
      <p className="text-[14px] text-[var(--text-standard)] line-clamp-2">
        {first.answer ?? "—"}
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

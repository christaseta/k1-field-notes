import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmission } from "@/lib/admin-queries";
import { displayAnswer } from "@/lib/questions";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/submissions"
          className="text-[13px] text-[var(--text-subtle)] hover:text-[var(--text-strong)]"
        >
          ← All submissions
        </Link>
        <h1 className="text-[28px] font-medium mt-2 capitalize">
          {submission.kind} submission
        </h1>
        <div className="text-[13px] text-[var(--text-subtle)] mt-1">
          {new Date(submission.submitted_at).toLocaleString()}
        </div>
      </div>

      <section className="border border-[#2a2a2a] rounded-lg p-5">
        <div className="text-[12px] uppercase tracking-wide text-[var(--text-subtle)] mb-2">
          Seller
        </div>
        {submission.seller ? (
          <Link
            href={`/admin/sellers/${submission.seller.id}`}
            className="text-[16px] hover:text-[var(--text-strong)]"
          >
            {submission.seller.display_name || submission.seller.email}{" "}
            <span className="text-[var(--text-subtle)]">
              ({submission.seller.email})
            </span>
          </Link>
        ) : (
          <span>{submission.seller_id}</span>
        )}
      </section>

      {submission.note && (
        <section className="border border-[#2a2a2a] rounded-lg p-5">
          <div className="text-[12px] uppercase tracking-wide text-[var(--text-subtle)] mb-2">
            Note
          </div>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {submission.note}
          </p>
        </section>
      )}

      {submission.tags?.length > 0 && (
        <section className="border border-[#2a2a2a] rounded-lg p-5">
          <div className="text-[12px] uppercase tracking-wide text-[var(--text-subtle)] mb-2">
            Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {submission.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 border border-[#2a2a2a] rounded-full text-[13px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {submission.answers?.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="text-[12px] uppercase tracking-wide text-[var(--text-subtle)]">
            Answers
          </div>
          {submission.answers.map((a, i) => (
            <div key={i} className="border border-[#2a2a2a] rounded-lg p-5">
              <div className="text-[13px] text-[var(--text-subtle)] mb-1">
                {a.input_method} · {a.type}
              </div>
              <div className="text-[15px] font-medium mb-2">{a.prompt}</div>
              <div className="text-[15px] whitespace-pre-wrap leading-relaxed">
                {displayAnswer(a) || (
                  <span className="text-[var(--text-subtle)] italic">No answer</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

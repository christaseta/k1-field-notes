"use client";

import { useEffect, useState } from "react";
import {
  fetchSubmissionDetail,
  type SubmissionDetailResult,
} from "@/app/actions/submission";
import type { SubmissionWithSeller } from "@/lib/admin-queries";
import { displayAnswer } from "@/lib/questions";
import { MediaGallery } from "./MediaThumbs";

export default function SubmissionModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<SubmissionDetailResult | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetchSubmissionDetail(id).then((r) => {
      if (!cancelled) setState(r);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="submodal__backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="submodal__sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="submodal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {state === "loading" && (
          <div className="submodal__empty">Loading…</div>
        )}

        {typeof state !== "string" && !state.ok && (
          <div className="submodal__empty">{state.error}</div>
        )}

        {typeof state !== "string" && state.ok && (
          <SubmissionDetailBody submission={state.submission} />
        )}
      </div>
    </div>
  );
}

function SubmissionDetailBody({ submission }: { submission: SubmissionWithSeller }) {
  const seller = submission.seller;
  const name = seller?.display_name || seller?.email || submission.seller_id;
  const initials = (() => {
    const src = seller?.display_name || seller?.email || "?";
    const parts = src.split(/[\s._@-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  })();
  const date = new Date(submission.submitted_at);

  return (
    <>
      <header className="submodal__head">
        <div className="submodal__kind">{submission.kind} submission</div>
        <h2 className="submodal__title">
          {submission.kind === "spontaneous"
            ? "Spontaneous note"
            : submission.kind === "weekly"
              ? "Weekly check-in"
              : "Daily check-in"}
        </h2>
        <div className="submodal__meta">
          <div className="pchip">
            <span className="pchip__avatar">{initials}</span>
            <span className="pchip__id">{name}</span>
          </div>
          <span className="submodal__metaSep">·</span>
          <span>{date.toLocaleString()}</span>
        </div>
      </header>

      {submission.tags?.length > 0 && (
        <section className="submodal__section">
          <h3 className="submodal__sectionHead">Tags</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {submission.tags.map((t) => (
              <span key={t} className="chip is-tag">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {submission.note && (
        <section className="submodal__section">
          <h3 className="submodal__sectionHead">Note</h3>
          <p className="submodal__body">{submission.note}</p>
        </section>
      )}

      {submission.media_urls?.length > 0 && (
        <section className="submodal__section">
          <h3 className="submodal__sectionHead">
            Photos · {submission.media_urls.length}
          </h3>
          <MediaGallery urls={submission.media_urls} />
        </section>
      )}

      {submission.answers?.length > 0 && (
        <section className="submodal__section">
          <h3 className="submodal__sectionHead">Answers</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {submission.answers.map((a, i) => (
              <div key={i} className="submodal__answer">
                <div className="submodal__answerMeta">
                  {a.input_method} · {a.type}
                </div>
                <div className="submodal__answerPrompt">{a.prompt}</div>
                <div className="submodal__answerBody">
                  {displayAnswer(a) || (
                    <span style={{ color: "var(--wf-ink-3)", fontStyle: "italic" }}>
                      No answer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

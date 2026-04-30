"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Question, QuestionSet } from "@/lib/questions";
import type { FeedbackKind } from "@/lib/db-types";
import { VoiceTextInput } from "./VoiceTextInput";
import { submitFeedback } from "@/app/actions/submit";

type Props = {
  set: QuestionSet;
  kind: Extract<FeedbackKind, "daily" | "weekly">;
};

export function QuestionRunner({ set, kind }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputMethods, setInputMethods] = useState<
    Record<string, "voice" | "text" | "choice">
  >({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const visibleQuestions = useMemo(
    () => set.questions.filter((q) => isVisible(q, answers)),
    [set.questions, answers],
  );

  const total = visibleQuestions.length;
  const current = visibleQuestions[Math.min(step, total - 1)];
  const isLast = step >= total - 1;

  if (!current) return null;

  const setAnswer = (
    id: string,
    value: string,
    method: "voice" | "text" | "choice",
  ) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setInputMethods((m) => ({ ...m, [id]: method }));
  };

  const onNext = () => {
    setError(null);
    const value = answers[current.id]?.trim() ?? "";
    if (current.type === "multiple_choice" && !value) {
      setError("Pick one to continue.");
      return;
    }
    if (isLast) {
      startTransition(async () => {
        try {
          await submitFeedback({ kind, answers, inputMethods });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  const onBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="space-y-6 pb-32">
      <ProgressBar step={step + 1} total={total} />

      <div className="space-y-5">
        <p className="text-[12px] tracking-wider uppercase text-[var(--text-subtle)] font-medium">
          Question {step + 1} of {total}
        </p>
        <h2 className="text-[24px] leading-[28px] -tracking-[0.18px] font-medium text-[var(--text-strong)]">
          {current.prompt}
        </h2>

        {current.type === "multiple_choice" ? (
          <div className="space-y-3 pt-1">
            {current.choices.map((c) => {
              const selected = answers[current.id] === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setAnswer(current.id, c.value, "choice")}
                  className={`w-full text-left px-5 py-4 rounded-2xl text-[16px] transition-colors ${
                    selected
                      ? "bg-[var(--accent)] text-[var(--text-on-accent)] font-medium"
                      : "bg-[var(--bg-card)] text-[var(--text-standard)] hover:bg-[#222]"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : (
          <VoiceTextInput
            value={answers[current.id] ?? ""}
            onChange={(value, method) => setAnswer(current.id, value, method)}
            placeholder={current.placeholder}
            autoFocus
          />
        )}
      </div>

      {error && (
        <p className="text-[13px] text-[#ff8b8b] text-center" role="alert">
          {error}
        </p>
      )}

      <div className="fixed bottom-20 inset-x-0 px-4 safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            type="button"
            onClick={step === 0 ? () => router.push("/home") : onBack}
            className="flex-1 py-4 rounded-2xl border border-[var(--divider)] bg-[var(--bg-card)] text-[var(--text-standard)] font-medium hover:bg-[#222]"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={pending}
            className="flex-[2] py-4 rounded-2xl bg-[var(--accent)] text-[var(--text-on-accent)] font-medium hover:bg-[var(--accent-strong)] disabled:opacity-60"
          >
            {pending ? "Submitting…" : isLast ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="h-1 bg-[var(--divider)] rounded-full overflow-hidden">
      <div
        className="h-full bg-[var(--accent)] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function isVisible(q: Question, answers: Record<string, string>): boolean {
  if (!q.showWhen) return true;
  const parent = answers[q.showWhen.questionId];
  return parent ? q.showWhen.whenAnswerIn.includes(parent) : false;
}

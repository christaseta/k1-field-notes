"use client";

import { useMemo, useState, useTransition } from "react";
import type { Question, QuestionSet } from "@/lib/questions";
import type { FeedbackKind } from "@/lib/db-types";
import { VoiceTextInput } from "./VoiceTextInput";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { TitleBar } from "./TitleBar";
import { SegmentedProgress } from "./SegmentedProgress";
import { submitFeedback } from "@/app/actions/submit";

type Props = {
  set: QuestionSet;
  kind: Extract<FeedbackKind, "daily" | "weekly">;
};

const TITLE_BY_KIND: Record<Props["kind"], string> = {
  daily: "Daily update",
  weekly: "Weekly update",
};

export function QuestionRunner({ set, kind }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputMethods, setInputMethods] = useState<
    Record<string, "voice" | "text" | "choice">
  >({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  const currentValue = answers[current.id]?.trim() ?? "";
  // MC requires a selection; open is optional (skippable) per the brief.
  const canAdvance =
    current.type === "multiple_choice" ? currentValue.length > 0 : true;

  const onNext = () => {
    setError(null);
    if (current.type === "multiple_choice" && !currentValue) {
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

  return (
    <>
      <TitleBar
        title={TITLE_BY_KIND[kind]}
        right={`Question ${step + 1} of ${total}`}
      />

      <div className="max-w-md w-full mx-auto px-4 pt-3">
        <SegmentedProgress current={step + 1} total={total} />
      </div>

      <div className="max-w-md w-full mx-auto px-4 pt-10 pb-32">
        <h2 className="text-[32px] leading-[32px] -tracking-[0.8px] font-normal text-[var(--text-standard)]">
          {current.prompt}
        </h2>

        <div className="pt-10">
          {current.type === "multiple_choice" ? (
            <MultipleChoiceQuestion
              choices={current.choices}
              value={answers[current.id] ?? null}
              onChange={(value) => setAnswer(current.id, value, "choice")}
            />
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
          <p className="text-[13px] text-[#ff8b8b] text-center pt-4" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Single full-width Next, fixed above the tab bar. */}
      <div className="fixed bottom-16 inset-x-0 px-4 pb-2 pt-2 bg-[var(--bg-app)]">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={onNext}
            disabled={!canAdvance || pending}
            className={`w-full min-h-[48px] py-3 px-6 rounded-full text-[16px] font-medium transition-colors ${
              canAdvance && !pending
                ? "bg-white text-black hover:bg-slate-100"
                : "bg-[#2a2a2a] text-[var(--text-disabled)] cursor-not-allowed"
            }`}
          >
            {pending ? "Submitting…" : isLast ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}

function isVisible(q: Question, answers: Record<string, string>): boolean {
  if (!q.showWhen) return true;
  const parent = answers[q.showWhen.questionId];
  return parent ? q.showWhen.whenAnswerIn.includes(parent) : false;
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Question, QuestionSet } from "@/lib/questions";
import type { FeedbackKind } from "@/lib/db-types";
import { OpenAnswerInput } from "./OpenAnswerInput";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { TitleBar } from "./TitleBar";
import { SegmentedProgress } from "./SegmentedProgress";
import { Icon } from "./Icon";
import { submitFeedback } from "@/app/actions/submit";

type Props = {
  set: QuestionSet;
  kind: Extract<FeedbackKind, "daily" | "weekly">;
  /** "page" renders a full-screen flow; "sheet" renders inside a bottom sheet. */
  variant?: "page" | "sheet";
  /** Sheet variant only: called when the close button is tapped. */
  onClose?: () => void;
};

const TITLE_BY_KIND: Record<Props["kind"], string> = {
  daily: "Daily update",
  weekly: "Weekly update",
};

export function QuestionRunner({ set, kind, variant = "page", onClose }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputMethods, setInputMethods] = useState<
    Record<string, "voice" | "text" | "choice">
  >({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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

  const currentValue = answers[current.id]?.trim() ?? "";
  // Every question requires an answer — MC needs a selection, open needs text.
  const canAdvance = currentValue.length > 0;

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
          setSubmitted(true);
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  const submitButton = (
    <button
      type="button"
      onClick={onNext}
      disabled={!canAdvance || pending}
      className={`w-full min-h-[64px] py-3 px-6 rounded-full text-[16px] font-medium transition-colors ${
        canAdvance && !pending
          ? "bg-white text-black hover:bg-slate-100"
          : "bg-[#1A1A1A] text-[var(--text-disabled)] cursor-not-allowed"
      }`}
    >
      {pending ? "Submitting…" : isLast ? "Submit" : "Next"}
    </button>
  );

  const isOpen = current.type !== "multiple_choice";
  const questionBody = (
    <div key={current.id} className="animate-step-enter flex flex-col h-full">
      <h2 className="text-[28px] leading-[32px] -tracking-[0.7px] font-normal text-[var(--text-standard)]">
        {current.prompt}
      </h2>
      {current.type === "multiple_choice" ? (
        <div className="pt-10">
          <MultipleChoiceQuestion
            choices={current.choices}
            value={answers[current.id] ?? null}
            onChange={(value) => setAnswer(current.id, value, "choice")}
          />
        </div>
      ) : null}
      {error && (
        <p className="text-[13px] text-[#ff8b8b] text-center pt-4" role="alert">
          {error}
        </p>
      )}
    </div>
  );

  const openHero = isOpen && current.type === "open" ? (
    <div key={current.id} className="animate-step-enter flex-1 min-h-0 flex items-center justify-center">
      <h1 className="text-center text-[28px] leading-[32px] -tracking-[0.7px] text-[var(--text-strong)] font-normal px-2">
        {current.prompt}
      </h1>
    </div>
  ) : null;

  const openInput = isOpen && current.type === "open" ? (
    <OpenAnswerInput
      value={answers[current.id] ?? ""}
      onChange={(value, method) => setAnswer(current.id, value, method)}
      onSubmit={onNext}
      placeholder={current.placeholder}
      pending={pending}
      autoFocus
    />
  ) : null;

  if (submitted) {
    const thanksBody = (
      <div className="flex flex-col items-center text-center space-y-5">
        <Icon name="check-fill" size={48} className="text-white" />
        <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] font-medium text-[var(--text-strong)]">
          Thanks! Your note is in.
        </h1>
        <p className="text-[14px] text-[var(--text-subtle)]">
          The K1 team will see this in real time.
        </p>
      </div>
    );
    const doneButton = (
      <button
        type="button"
        onClick={() => {
          if (variant === "sheet") onClose?.();
          else router.push("/home");
        }}
        className="w-full min-h-[64px] py-3 px-6 rounded-full text-[16px] font-medium bg-white text-black hover:bg-slate-100"
      >
        Back to home
      </button>
    );

    if (variant === "sheet") {
      return (
        <>
          <div className="flex items-center justify-end px-4 py-2 min-h-[40px] shrink-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 p-2 text-[var(--text-strong)] hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 flex items-center justify-center animate-fade-in">
            {thanksBody}
          </div>
          <div className="px-4 pb-4 pt-2 shrink-0 bg-[#141414]">{doneButton}</div>
        </>
      );
    }

    return (
      <>
        <TitleBar backHref="/home" />
        <div className="max-w-md w-full mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100dvh-220px)] animate-step-enter">
          {thanksBody}
        </div>
        <div className="fixed bottom-16 inset-x-0 px-4 pb-2 pt-2 bg-[var(--bg-app)]">
          <div className="max-w-md mx-auto">{doneButton}</div>
        </div>
      </>
    );
  }

  if (variant === "sheet") {
    return (
      <>
        <div className="flex items-center justify-between px-4 py-2 min-h-[40px] gap-2 shrink-0">
          <p className="text-[14px] text-[var(--text-subtle)] tabular-nums">
            {step + 1} / {total}
          </p>
          <p className="text-[16px] font-medium text-[var(--text-strong)]">
            {TITLE_BY_KIND[kind]}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 p-2 text-[var(--text-strong)] hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-4 pt-1 shrink-0">
          <SegmentedProgress current={step + 1} total={total} />
        </div>
        {isOpen ? (
          <div className="flex-1 min-h-0 flex flex-col bg-[var(--bg-app)] -mx-px">
            <div className="flex-1 min-h-0 px-4 flex flex-col">
              {openHero}
            </div>
            {error && (
              <p className="text-[13px] text-[#ff8b8b] text-center px-4 pb-2" role="alert">
                {error}
              </p>
            )}
            <div className="px-4 pb-4 pt-2 shrink-0">
              {openInput}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-10 pb-4 flex flex-col">
              {questionBody}
            </div>
            <div className="px-4 pb-4 pt-0 shrink-0 bg-[#141414]">
              {submitButton}
            </div>
          </>
        )}
      </>
    );
  }

  if (isOpen) {
    return (
      <div className="h-[100dvh] flex flex-col overflow-hidden">
        <TitleBar
          title={TITLE_BY_KIND[kind]}
          right={`Question ${step + 1} of ${total}`}
          backHref="/home"
        />
        <div className="max-w-md w-full mx-auto px-4 pt-3">
          <SegmentedProgress current={step + 1} total={total} />
        </div>
        <main className="flex-1 min-h-0 max-w-md w-full mx-auto px-4 flex flex-col">
          {openHero}
          {error && (
            <p className="text-[13px] text-[#ff8b8b] text-center pb-2" role="alert">
              {error}
            </p>
          )}
          <div className="pb-6 pt-2">{openInput}</div>
        </main>
      </div>
    );
  }

  return (
    <>
      <TitleBar
        title={TITLE_BY_KIND[kind]}
        right={`Question ${step + 1} of ${total}`}
        backHref="/home"
      />

      <div className="max-w-md w-full mx-auto px-4 pt-3">
        <SegmentedProgress current={step + 1} total={total} />
      </div>

      <div className="max-w-md w-full mx-auto px-4 pt-10 pb-32">
        {questionBody}
      </div>

      <div className="fixed bottom-4 inset-x-0 px-4 pb-2 pt-2 bg-[var(--bg-app)]">
        <div className="max-w-md mx-auto">{submitButton}</div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function isVisible(q: Question, answers: Record<string, string>): boolean {
  if (!q.showWhen) return true;
  const parent = answers[q.showWhen.questionId];
  return parent ? q.showWhen.whenAnswerIn.includes(parent) : false;
}

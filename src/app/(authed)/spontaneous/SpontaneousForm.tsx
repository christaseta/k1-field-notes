"use client";

import { useState, useTransition } from "react";
import { VoiceTextInput } from "@/components/VoiceTextInput";
import { submitFeedback } from "@/app/actions/submit";

export function SpontaneousForm() {
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"voice" | "text">("text");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canSend = note.trim().length > 0;

  const submit = () => {
    setError(null);
    if (!canSend) {
      setError("Add a note before sending.");
      return;
    }
    startTransition(async () => {
      try {
        await submitFeedback({
          kind: "spontaneous",
          note,
          noteInputMethod: method,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return (
    <div className="space-y-4 pb-32">
      <VoiceTextInput
        value={note}
        onChange={(value, m) => {
          setNote(value);
          setMethod(m);
        }}
        placeholder="What happened, who was involved, what did you notice?"
        rows={6}
        autoFocus
      />

      {error && (
        <p className="text-[13px] text-[#ff8b8b] text-center" role="alert">
          {error}
        </p>
      )}

      <div className="fixed bottom-16 inset-x-0 px-4 pb-2 pt-2 bg-[var(--bg-app)]">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={submit}
            disabled={!canSend || pending}
            className={`w-full min-h-[48px] py-3 px-6 rounded-full text-[16px] font-medium transition-colors ${
              canSend && !pending
                ? "bg-white text-black hover:bg-slate-100"
                : "bg-[#2a2a2a] text-[var(--text-disabled)] cursor-not-allowed"
            }`}
          >
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VoiceTextInput } from "@/components/VoiceTextInput";
import { submitFeedback } from "@/app/actions/submit";

export function SpontaneousForm() {
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"voice" | "text">("text");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    setError(null);
    if (!note.trim()) {
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

      <div className="fixed bottom-20 inset-x-0 px-4 safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="flex-1 py-4 rounded-2xl border border-[var(--divider)] bg-[var(--bg-card)] text-[var(--text-standard)] font-medium hover:bg-[#222]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="flex-[2] py-4 rounded-2xl bg-[var(--accent)] text-[var(--text-on-accent)] font-medium hover:bg-[var(--accent-strong)] disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

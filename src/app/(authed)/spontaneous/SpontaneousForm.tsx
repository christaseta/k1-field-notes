"use client";

import { useEffect, useState, useTransition } from "react";
import { VoiceTextInput } from "@/components/VoiceTextInput";
import { submitFeedback } from "@/app/actions/submit";
import { SPONTANEOUS_TAGS } from "@/lib/tags";
import { SPONTANEOUS_DRAFT_KEY } from "@/components/VoicePromptHero";

export function SpontaneousForm() {
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"voice" | "text">("text");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Pull a pre-recorded transcript handed off from the home-screen mic.
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(SPONTANEOUS_DRAFT_KEY);
      if (draft && draft.trim().length > 0) {
        setNote(draft);
        setMethod("voice");
      }
      sessionStorage.removeItem(SPONTANEOUS_DRAFT_KEY);
    } catch {
      // sessionStorage may not be available (private mode); ignore.
    }
  }, []);

  const canSend = note.trim().length > 0;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

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
          tags,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return (
    <div className="space-y-6 pb-32">
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

      <div className="space-y-3">
        <p className="text-[14px] text-[var(--text-subtle)]">
          Tag this note (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {SPONTANEOUS_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={active}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-[#d9d9d9] text-black"
                    : "bg-[var(--bg-card)] text-[var(--text-standard)] hover:bg-[#222]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

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

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Icon } from "@/components/Icon";
import { Sheet } from "@/components/Sheet";
import { submitFeedback } from "@/app/actions/submit";
import { SPONTANEOUS_DRAFT_KEY } from "@/components/VoicePromptHero";

export function SpontaneousForm() {
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"voice" | "text">("text");
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { status, transcript, start, stop, supported, setTranscript } =
    useSpeechRecognition();
  const isListening = status === "listening";

  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(SPONTANEOUS_DRAFT_KEY);
      if (draft && draft.trim().length > 0) {
        setNote(draft);
        setMethod("voice");
      }
      sessionStorage.removeItem(SPONTANEOUS_DRAFT_KEY);
    } catch {
      // sessionStorage may be unavailable (private mode); ignore.
    }
  }, []);

  // Mirror live transcript into the note while listening.
  useEffect(() => {
    if (isListening && transcript !== note) {
      setMethod("voice");
      setNote(transcript);
    }
  }, [transcript, isListening, note]);

  const canSend = note.trim().length > 0 && !pending;

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
          tags: [],
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return (
    <div className="pt-2 pb-6">
      {error && (
        <p className="text-[13px] text-[#ff8b8b] text-center mb-2" role="alert">
          {error}
        </p>
      )}
      <div className="bg-[var(--bg-card)] border border-[var(--divider)] rounded-3xl p-3 flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          value={note}
          rows={2}
          autoFocus
          onChange={(e) => {
            const next = e.target.value;
            setMethod("text");
            setTranscript(next);
            setNote(next);
          }}
          placeholder="What happened? Who was there? What did you notice?"
          className="w-full bg-transparent text-[16px] text-[var(--text-standard)] placeholder:text-[var(--text-disabled)] focus:outline-none resize-none px-2"
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="More options"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--divider)] text-[var(--text-subtle)] hover:text-white"
          >
            <span className="text-[20px] leading-none">+</span>
          </button>
          <div className="flex items-center gap-2">
            {supported && (
              <button
                type="button"
                onClick={isListening ? stop : start}
                aria-pressed={isListening}
                aria-label={isListening ? "Stop dictating" : "Start dictating"}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  isListening
                    ? "bg-[#ff8b8b] text-black"
                    : "bg-white text-black hover:bg-slate-100"
                }`}
              >
                <Icon name="mic" size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send"
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                canSend
                  ? "bg-white text-black"
                  : "bg-[#2a2a2a] text-[var(--text-disabled)] cursor-not-allowed"
              }`}
            >
              <Icon name="arrow-up" size={20} />
            </button>
          </div>
        </div>
      </div>
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} variant="compact">
        <div className="px-4 pb-8 pt-2">
          <button
            type="button"
            disabled
            className="w-full text-left px-4 py-4 rounded-2xl text-[16px] text-[var(--text-disabled)] cursor-not-allowed"
          >
            Attach photo/video
          </button>
        </div>
      </Sheet>
    </div>
  );
}

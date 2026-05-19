"use client";

import { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";

type Props = {
  value: string;
  onChange: (value: string, inputMethod: "voice" | "text") => void;
  onSubmit: () => void;
  placeholder?: string;
  pending?: boolean;
  autoFocus?: boolean;
};

/**
 * Bottom-anchored card with textarea + voice + send, mirroring the
 * /spontaneous note entry. Used for "open" questions in the daily/weekly
 * check-ins so the open-ended input feels like the same surface.
 */
export function OpenAnswerInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  pending,
  autoFocus,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { status, transcript, start, stop, supported, setTranscript } =
    useSpeechRecognition();
  const isListening = status === "listening";

  useEffect(() => {
    if (isListening && transcript !== value) {
      onChange(transcript, "voice");
    }
  }, [transcript, isListening, value, onChange]);

  const canSend = value.trim().length > 0 && !pending;

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-3xl p-3 flex flex-col gap-[44px]">
        <textarea
          ref={textareaRef}
          value={value}
          rows={2}
          autoFocus={autoFocus}
          onChange={(e) => {
            const next = e.target.value;
            setTranscript(next);
            onChange(next, "text");
          }}
          placeholder={placeholder}
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
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-slate-100"
                }`}
              >
                <Icon name="mic" size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSend}
              aria-label="Send"
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                canSend
                  ? "bg-white text-black"
                  : "bg-[#2a2a2a] text-[var(--text-disabled)] cursor-not-allowed"
              }`}
            >
              <Icon name="arrow-up" size={32} />
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
    </>
  );
}

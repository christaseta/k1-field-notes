"use client";

import { useEffect, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Icon } from "./Icon";

type Props = {
  name?: string;
  value?: string;
  onChange?: (value: string, inputMethod: "voice" | "text") => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
};

/**
 * Combined dictate-or-type field. Voice fills the textarea; the seller can
 * always edit before submitting.
 */
export function VoiceTextInput({
  name,
  value: controlled,
  onChange,
  placeholder,
  rows = 5,
  autoFocus,
}: Props) {
  const { status, transcript, start, stop, supported, setTranscript } =
    useSpeechRecognition();
  const [inputMethod, setInputMethod] = useState<"voice" | "text">("text");
  const [internal, setInternal] = useState(controlled ?? "");

  const value = controlled ?? internal;

  useEffect(() => {
    if (status === "listening" && transcript !== value) {
      setInputMethod("voice");
      if (controlled === undefined) setInternal(transcript);
      onChange?.(transcript, "voice");
    }
  }, [transcript, status, value, controlled, onChange]);

  const isListening = status === "listening";

  return (
    <div className="space-y-3">
      {supported && (
        <div className="flex items-center justify-center pt-2 pb-3">
          <button
            type="button"
            onClick={isListening ? stop : start}
            aria-pressed={isListening}
            aria-label={isListening ? "Stop recording" : "Start recording"}
            className={`flex items-center justify-center rounded-full transition-all ${
              isListening
                ? "w-20 h-20 bg-[#ff4d4d] text-white shadow-[0_0_0_8px_rgba(255,77,77,0.2)]"
                : "w-20 h-20 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-strong)] active:scale-95"
            }`}
          >
            <Icon name="mic" size={32} />
          </button>
        </div>
      )}

      {supported && (
        <p className="text-center text-[12px] text-[var(--text-subtle)]">
          {isListening
            ? "Listening… tap to stop"
            : status === "error"
              ? "Mic error — type below"
              : "Tap to dictate, or type below"}
        </p>
      )}

      <textarea
        name={name}
        value={value}
        rows={rows}
        autoFocus={autoFocus}
        onChange={(e) => {
          const next = e.target.value;
          setInputMethod("text");
          setTranscript(next);
          if (controlled === undefined) setInternal(next);
          onChange?.(next, "text");
        }}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--divider)] rounded-2xl text-[16px] text-[var(--text-standard)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent)] resize-none"
      />
      <input type="hidden" name={`${name}__method`} value={inputMethod} />

      {!supported && (
        <p className="text-[12px] text-[var(--text-subtle)]">
          Voice input isn&apos;t available on this browser — type your answer above.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Icon } from "./Icon";
import { AttachmentTray, useAttachments } from "./AttachmentTray";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const { attachments, add, remove, atCap } = useAttachments();

  const { status, transcript, start, stop, supported, setTranscript } =
    useSpeechRecognition();
  const isListening = status === "listening";

  useEffect(() => {
    if (isListening && transcript !== value) {
      onChange(transcript, "voice");
    }
  }, [transcript, isListening, value, onChange]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const canSend =
    (value.trim().length > 0 || attachments.length > 0) && !pending;

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl p-3 flex flex-col gap-[56px]">
      <div className="flex flex-col gap-3">
        <AttachmentTray attachments={attachments} onRemove={remove} />
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
        className="w-full bg-transparent text-[16px] text-[var(--text-standard)] placeholder:text-[var(--text-disabled)] focus:outline-none resize-none px-2 min-h-[44px]"
      />
      </div>
      <div className="flex items-center justify-between">
        <div className="relative" ref={menuRef}>
          {menuOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 mb-2 min-w-[220px] p-1 bg-[#2A2A2A] rounded-2xl shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                disabled={atCap}
                onClick={() => {
                  cameraInputRef.current?.click();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-[14px] text-white hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Take photo or video
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={atCap}
                onClick={() => {
                  libraryInputRef.current?.click();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-[14px] text-white hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Choose from library
              </button>
            </div>
          )}
          <button
            type="button"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2a2a2a] text-white"
          >
            <span className="text-[20px] leading-none">+</span>
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={libraryInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
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
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Icon } from "@/components/Icon";
import { AttachmentTray, useAttachments } from "@/components/AttachmentTray";
import { submitFeedback } from "@/app/actions/submit";
import { SPONTANEOUS_DRAFT_KEY } from "@/components/VoicePromptHero";
import { uploadAttachmentsToStorage } from "@/lib/upload-media";

export function SpontaneousForm() {
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"voice" | "text">("text");
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { attachments, add, remove, atCap } = useAttachments();

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

  const canSend =
    (note.trim().length > 0 || attachments.length > 0) && !pending;

  const submit = () => {
    setError(null);
    if (isListening) stop();
    if (!note.trim()) {
      setError("Add a note before sending.");
      return;
    }
    startTransition(async () => {
      try {
        const mediaUrls = await uploadAttachmentsToStorage(attachments);
        await submitFeedback({
          kind: "spontaneous",
          note,
          noteInputMethod: method,
          tags: [],
          mediaUrls,
        });
        router.push("/thanks");
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
      <div className="bg-[var(--bg-card)] rounded-3xl p-3 flex flex-col gap-[56px]">
        <div className="flex flex-col gap-3">
          <AttachmentTray attachments={attachments} onRemove={remove} />
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
              accept="image/*"
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
              accept="image/*"
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
              onClick={submit}
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
    </div>
  );
}

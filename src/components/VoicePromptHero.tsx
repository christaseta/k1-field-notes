"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

/** sessionStorage key the spontaneous form reads on mount to pre-fill. */
export const SPONTANEOUS_DRAFT_KEY = "fieldnotes:spontaneous-draft";

/**
 * Hero CTA on the home screen. Tapping the body navigates to /spontaneous.
 * Press-and-hold the mic icon to start mic capture with a live waveform plus
 * Web Speech transcription. On release, the transcript is stored in
 * sessionStorage and the seller is taken to /spontaneous to review, edit,
 * tag, and submit.
 */
export function VoicePromptHero() {
  const { status: visStatus, bars, start: startVis, stop: stopVis } =
    useAudioVisualizer();
  const {
    transcript,
    start: startSpeech,
    stop: stopSpeech,
    reset: resetSpeech,
    supported: speechSupported,
  } = useSpeechRecognition();
  const router = useRouter();

  // Mirror transcript into a ref so the pointerup handler always sees the
  // latest value without re-binding listeners.
  const transcriptRef = useRef("");
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const holdingRef = useRef(false);

  const beginHold = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    resetSpeech();
    void startVis();
    if (speechSupported) startSpeech();
  }, [resetSpeech, startVis, startSpeech, speechSupported]);

  const endHold = useCallback(
    (commit: boolean) => {
      if (!holdingRef.current) return;
      holdingRef.current = false;
      stopVis();
      stopSpeech();

      if (commit) {
        const text = transcriptRef.current.trim();
        try {
          sessionStorage.setItem(SPONTANEOUS_DRAFT_KEY, text);
        } catch {
          // sessionStorage may be unavailable (private mode) — proceed without it.
        }
        router.push("/spontaneous");
      }
    },
    [stopVis, stopSpeech, router],
  );

  // Defensive cleanup if the user lifts the pointer outside the button or
  // navigates away mid-press.
  useEffect(() => {
    const handleUp = () => endHold(true);
    const handleCancel = () => endHold(false);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
    return () => {
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
    };
  }, [endHold]);

  const isActive = visStatus === "active" || visStatus === "starting";

  return (
    <div className="relative overflow-hidden rounded-full border border-[#333333] bg-black">
      <div className="flex items-center gap-4 pl-4 pr-2 py-2">
        {isActive ? (
          <Waveform bars={bars} />
        ) : (
          <Link
            href="/spontaneous"
            className="flex-1 text-[16px] font-medium text-white leading-tight"
          >
            {visStatus === "denied"
              ? "Mic blocked — tap to type instead"
              : visStatus === "error"
                ? "Mic error — tap to type instead"
                : "Record observations in real time"}
          </Link>
        )}
        <button
          type="button"
          aria-label={isActive ? "Recording — release to stop" : "Hold to record"}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
            beginHold();
          }}
          onPointerUp={() => endHold(true)}
          onContextMenu={(e) => e.preventDefault()}
          className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 select-none transition-colors ${
            isActive
              ? "bg-white text-black scale-95"
              : "bg-[#f0f0f0] text-[#101010] active:bg-white"
          }`}
        >
          <Icon name="mic" size={20} />
        </button>
      </div>
    </div>
  );
}

function Waveform({ bars }: { bars: number[] }) {
  return (
    <div
      className="w-[260px] flex items-center justify-center gap-[4px] h-12"
      aria-hidden
    >
      {bars.map((amp, i) => {
        const h = Math.max(4, Math.round(amp * 44));
        return (
          <span
            key={i}
            className="w-[4px] rounded-full bg-white transition-[height] duration-75"
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionInstance = any;

type Status = "idle" | "listening" | "error" | "unsupported";

/**
 * Web Speech API wrapper. Returns the live transcript and lets the caller
 * start/stop. iOS Safari supports this (16.4+) but quality varies, which is why
 * the UI must keep a textarea fallback that the seller can edit before submit.
 */
export function useSpeechRecognition() {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Text already committed in earlier "final" results — we append interim text on top.
  const finalRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus("unsupported");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript((finalRef.current + interim).trimStart());
    };

    recognition.onerror = () => setStatus("error");
    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  const start = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.start();
      setStatus("listening");
    } catch {
      // Already started — ignore.
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
  }, []);

  // Allow the seller to hand-edit the textarea after dictating.
  const setManualTranscript = useCallback((value: string) => {
    finalRef.current = value;
    setTranscript(value);
  }, []);

  return {
    status,
    transcript,
    start,
    stop,
    reset,
    setTranscript: setManualTranscript,
    supported: status !== "unsupported",
  };
}

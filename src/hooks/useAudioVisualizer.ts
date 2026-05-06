"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VisualizerStatus = "idle" | "starting" | "active" | "denied" | "error";

const NUM_BARS = 18;
const FFT_SIZE = 64; // gives 32 frequency bins; we down-sample to NUM_BARS.

/**
 * Captures mic audio while active and exposes a normalized 0–1 amplitude
 * value per visualization bar. The caller drives start/stop — typical use is
 * a press-and-hold button.
 */
export function useAudioVisualizer() {
  const [status, setStatus] = useState<VisualizerStatus>("idle");
  const [bars, setBars] = useState<number[]>(() => new Array(NUM_BARS).fill(0));

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (status === "active" || status === "starting") return;
    setStatus("starting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const step = Math.floor(buf.length / NUM_BARS) || 1;

      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const next: number[] = [];
        for (let i = 0; i < NUM_BARS; i++) {
          // Sample one bin per bar across the spectrum, normalize to 0–1.
          next.push(buf[i * step] / 255);
        }
        setBars(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setStatus("active");
    } catch (err) {
      cleanup();
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setStatus(denied ? "denied" : "error");
    }
  }, [status, cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setBars(new Array(NUM_BARS).fill(0));
    setStatus("idle");
  }, [cleanup]);

  // Stop on unmount.
  useEffect(() => cleanup, [cleanup]);

  return { status, bars, start, stop };
}

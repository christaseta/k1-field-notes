"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";

/** sessionStorage key the spontaneous form reads on mount to pre-fill. */
export const SPONTANEOUS_DRAFT_KEY = "fieldnotes:spontaneous-draft";

/**
 * Hero CTA on the home screen. Tapping plays a deliberate "press + fade"
 * animation before navigating to /spontaneous so the route transition
 * reads as a distinct gesture, not an instant cut.
 */
export function VoicePromptHero() {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const navigate = () => {
    if (leaving) return;
    setLeaving(true);
    // Let the press/fade animation play, then route.
    setTimeout(() => router.push("/spontaneous"), 520);
  };

  return (
    <a
      href="/spontaneous"
      onClick={(e) => {
        e.preventDefault();
        navigate();
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className={`relative overflow-hidden rounded-full bg-white/[0.04] backdrop-blur-md ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center gap-4 pl-4 pr-2 py-2 transition-all duration-[520ms] ease-out hover:bg-white/[0.08] ${
        leaving
          ? "scale-[0.94] opacity-0"
          : pressed
            ? "scale-[0.97] bg-white/[0.1]"
            : ""
      }`}
    >
      <span className="flex-1 text-[20px] font-normal text-[#909090] leading-tight">
        Record observations...
      </span>
      <span className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 bg-[#f0f0f0] text-[#101010]">
        <Icon name="send" size={24} />
      </span>
    </a>
  );
}

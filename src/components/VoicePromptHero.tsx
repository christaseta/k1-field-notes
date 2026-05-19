import Link from "next/link";
import { Icon } from "./Icon";

/** sessionStorage key the spontaneous form reads on mount to pre-fill. */
export const SPONTANEOUS_DRAFT_KEY = "fieldnotes:spontaneous-draft";

/**
 * Hero CTA on the home screen. Tapping anywhere navigates to /spontaneous
 * where the seller can type or dictate an observation.
 */
export function VoicePromptHero() {
  return (
    <Link
      href="/spontaneous"
      className="relative overflow-hidden rounded-full bg-white/[0.04] backdrop-blur-md ring-1 ring-inset ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center gap-4 pl-4 pr-2 py-2"
    >
      <span className="flex-1 text-[20px] font-normal text-[#909090] leading-tight">
        Record observations...
      </span>
      <span className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 bg-[#f0f0f0] text-[#101010]">
        <Icon name="arrow-up" size={32} />
      </span>
    </Link>
  );
}

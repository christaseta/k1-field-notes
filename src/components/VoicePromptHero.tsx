import Link from "next/link";
import { Icon } from "./Icon";

/**
 * Hero CTA at the top of the home screen. Links into the spontaneous-feedback
 * flow. Background art is /public/voice-promt.png (360×90, matching Figma).
 */
export function VoicePromptHero() {
  return (
    <Link
      href="/spontaneous"
      className="block relative overflow-hidden rounded-full active:scale-[0.99] transition-transform"
      style={{
        backgroundImage: "url(/voice-promt.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex items-center gap-4 px-3 py-3 pr-6">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#f0f0f0] text-[#101010] shrink-0">
          <Icon name="mic" size={20} />
        </span>
        <span className="text-[16px] font-normal text-[#101010] leading-tight">
          Record observations in real time
        </span>
      </div>
    </Link>
  );
}

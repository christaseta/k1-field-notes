"use client";

import { usePathname } from "next/navigation";
import { VoicePromptHero } from "./VoicePromptHero";

/**
 * Renders the home page's "Record observations" hero ONLY on /home.
 *
 * Belt-and-suspenders: the component is only mounted from the home page
 * already, but a client-side pathname check guarantees the hero never
 * leaks onto other routes if the tree ever changes. Wrapped in
 * `relative z-0` so a check-in Sheet (z-50) always paints above it.
 */
export function HomeVoiceHeroSlot() {
  const pathname = usePathname();
  if (pathname !== "/home") return null;
  return (
    <div className="relative z-0">
      <VoicePromptHero />
    </div>
  );
}

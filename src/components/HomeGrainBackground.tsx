"use client";

import { useEffect, useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";

/**
 * Animated grainy gradient background for the seller home screen.
 *
 * Replaces the static /dot-bg.png pattern with a slow-drifting shader that
 * carries a subtle grain. Pauses when the user prefers reduced motion.
 *
 * Sits behind the rest of the home content via absolute positioning; the
 * home page should render this as the first child of its full-bleed
 * wrapper.
 */
export function HomeGrainBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <GrainGradient
        style={{ width: "100%", height: "100%" }}
        colorBack="#000000"
        colors={["#1a1a1a", "#2a2a2a", "#0f0f0f"]}
        shape="wave"
        softness={0.7}
        intensity={0.35}
        noise={0.6}
        speed={reduceMotion ? 0 : 0.35}
      />
    </div>
  );
}

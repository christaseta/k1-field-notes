"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SpontaneousForm } from "./SpontaneousForm";
import { WordReveal } from "@/components/WordReveal";

export default function SpontaneousPage() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  // Warm /home so navigating back doesn't wait on a cold fetch.
  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  const handleBack = () => {
    if (leaving) return;
    setLeaving(true);
    // Animation: 240ms ease-out. Fire router.back() so we pop history and
    // reuse the cached RSC for /home instead of re-fetching it. We trigger
    // it just before the slide finishes so the new view is ready right as
    // the animation ends.
    setTimeout(() => {
      if (window.history.length > 1) router.back();
      else router.push("/home");
    }, 180);
  };

  return (
    <div
      className={`h-[100dvh] flex flex-col overflow-hidden bg-[var(--bg-app)] transition-transform duration-[240ms] ease-out ${
        leaving ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="safe-area-inset-top">
        <div className="max-w-md mx-auto flex items-center justify-end px-4 py-2.5 min-h-[40px] gap-2">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Close"
            className="-mr-2 p-2 text-[var(--text-strong)] hover:text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <main className="flex-1 min-h-0 max-w-md w-full mx-auto px-4 flex flex-col">
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <h1 className="text-center text-[32px] leading-[36px] -tracking-[0.5px] text-[var(--text-strong)] font-normal px-2">
            <WordReveal text="See something at the kiosk? Just talk." />
          </h1>
        </div>
        <SpontaneousForm />
      </main>
    </div>
  );
}

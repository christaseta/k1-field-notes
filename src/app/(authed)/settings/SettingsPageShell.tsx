"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Wraps the settings page in a slide-up entrance animation so navigation
 * from /home feels like a sheet rising into place. The same shell handles
 * the dismiss-down animation when the close button is tapped.
 */
export function SettingsPageShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Trigger the transform-from-translate-y-full → translate-y-0 on mount.
    const id = requestAnimationFrame(() => setEntered(true));
    router.prefetch("/home");
    return () => cancelAnimationFrame(id);
  }, [router]);

  const close = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => {
      if (window.history.length > 1) router.back();
      else router.push("/home");
    }, 240);
  };

  const visible = entered && !leaving;

  return (
    <div
      className={`min-h-[100dvh] bg-[var(--bg-app)] transition-transform duration-[320ms] ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 24px)",
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-end px-4 pb-2 min-h-[40px] gap-2">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-2 p-2 text-[var(--text-strong)] hover:text-white transition-transform duration-150 ease-out active:scale-90"
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
      {children}
    </div>
  );
}

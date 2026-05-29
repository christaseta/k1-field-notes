"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "installPromptDismissedAt";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const IOS_SHOW_DELAY_MS = 3000;

function isDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < DISMISS_TTL_MS;
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Already installed? Bail out.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Respect a recent dismissal.
    if (isDismissedRecently()) return;

    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // Android / Chromium: wait for the OS-provided install event.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS Safari: no programmatic install. Surface the manual instructions
    // after a short delay so the page has settled.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (iOS) {
      iosTimer = setTimeout(() => setShowInstallBanner(true), IOS_SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  // Don't render on the sign-in page (post-hooks, so we respect React rules).
  if (pathname === "/signin") return null;
  if (isStandalone) return null;
  if (!showInstallBanner) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore (private mode, etc.)
    }
  };

  return (
    <div
      className="fixed bottom-16 left-0 right-0 bg-black text-white px-4 pt-4 shadow-lg z-50 border-b border-[var(--divider)]"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <>
              <p className="text-sm text-[var(--text-standard)] mb-1">
                Add Field Notes to your home screen
              </p>
              <p className="text-xs text-[var(--text-subtle)] flex items-center gap-1.5 flex-wrap">
                <span>Tap</span>
                <IOSShareIcon />
                <span>then</span>
                <span className="font-medium text-white">Add to Home Screen</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-standard)]">
              Add Field Notes to your home screen for quicker access.
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-slate-100 transition-colors"
            >
              Add now
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-white hover:text-[var(--text-subtle)] p-1 transition-colors"
            aria-label="Dismiss"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function IOSShareIcon() {
  return (
    <svg
      className="inline-block w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Up arrow */}
      <path d="M12 4v12" />
      <path d="M7 9l5-5 5 5" />
      {/* Tray */}
      <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

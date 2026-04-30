"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS instructions if on iOS and not standalone
    if (iOS && !standalone) {
      // Delay showing to not be too aggressive
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Optionally store in localStorage to not show again
    localStorage.setItem("installPromptDismissed", "true");
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showInstallBanner) return null;

  // Check if previously dismissed
  if (typeof window !== "undefined" && localStorage.getItem("installPromptDismissed")) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-[var(--bg-card)] text-white p-4 shadow-lg z-50 safe-area-inset-bottom border-t border-[var(--divider)]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold">Install Field Notes</p>
          {isIOS ? (
            <p className="text-sm text-slate-300">
              Tap{" "}
              <span className="inline-flex items-center">
                <svg
                  className="w-4 h-4 mx-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V13a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" />
                  <path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </span>{" "}
              then &quot;Add to Home Screen&quot;
            </p>
          ) : (
            <p className="text-sm text-slate-300">
              Add to your home screen for the best experience
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-2 transition-colors"
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

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
    <div
      className="fixed bottom-16 left-0 right-0 bg-black text-white px-4 pt-4 shadow-lg z-50 border-b border-[var(--divider)]"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-[var(--text-standard)]">
            Add Field Notes to your home screen for quicker access.
          </p>
        </div>
        <div className="flex gap-2">
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

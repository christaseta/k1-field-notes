"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "loading" | "ios" | "android" | "desktop" | "installed";

/**
 * Settings-page card explaining how to add Field Notes to the device home
 * screen. Mirrors the platform detection in <InstallPrompt> but renders as
 * a persistent inline card instead of a dismissible banner. If the app is
 * already running as an installed PWA, it shows a confirmation state
 * instead of instructions.
 */
export function InstallInstructionsCard() {
  const [platform, setPlatform] = useState<Platform>("loading");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) {
      setPlatform("installed");
      return;
    }

    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    if (iOS) {
      setPlatform("ios");
      return;
    }

    // Android/Chromium: wait for the OS install event; fall back to a
    // desktop hint if it never fires.
    setPlatform("desktop");
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  if (platform === "loading") return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setPlatform("installed");
    setDeferredPrompt(null);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-3xl p-6 space-y-3">
      <p className="text-[16px] text-[var(--text-strong)]">
        {platform === "installed"
          ? "Field Notes is on your home screen"
          : "Save Field Notes to your home screen"}
      </p>

      {platform === "installed" && (
        <p className="text-[14px] text-[var(--text-subtle)]">
          You&apos;re running the installed app. No action needed.
        </p>
      )}

      {platform === "ios" && (
        <>
          <p className="text-[14px] text-[var(--text-subtle)] leading-relaxed">
            In Safari, tap the share button{" "}
            <IOSShareIcon /> at the bottom of the screen, then choose{" "}
            <span className="font-medium text-white">Add to Home Screen</span>.
          </p>
          <p className="text-[12px] text-[var(--text-subtle)]">
            Already-installed users get a faster app-like experience and quick
            access from their phone&apos;s home screen.
          </p>
        </>
      )}

      {platform === "android" && (
        <>
          <p className="text-[14px] text-[var(--text-subtle)]">
            Add Field Notes to your home screen for quicker access.
          </p>
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full mt-2 min-h-[64px] px-6 rounded-full bg-white text-black text-[16px] font-medium hover:bg-slate-100"
          >
            Add to home screen
          </button>
        </>
      )}

      {platform === "desktop" && (
        <p className="text-[14px] text-[var(--text-subtle)] leading-relaxed">
          Open this page in your phone&apos;s browser (Safari on iPhone, Chrome
          on Android) to add Field Notes to your home screen.
        </p>
      )}
    </div>
  );
}

function IOSShareIcon() {
  return (
    <svg
      className="inline-block w-4 h-4 align-text-bottom"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4v12" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

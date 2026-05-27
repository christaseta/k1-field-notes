"use client";

import { useState } from "react";
import { generateInviteLink } from "@/app/actions/invite";

type State = "idle" | "loading" | "copied" | "error";

export default function CopyLinkButton({ email }: { email: string }) {
  const [state, setState] = useState<State>("idle");

  async function onClick() {
    setState("loading");
    const fd = new FormData();
    fd.set("email", email);
    try {
      const result = await generateInviteLink(null, fd);
      if (!result.ok) {
        setState("error");
      } else {
        await navigator.clipboard.writeText(result.url);
        setState("copied");
      }
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 1800);
  }

  const label =
    state === "loading"
      ? "…"
      : state === "copied"
        ? "Copied ✓"
        : state === "error"
          ? "Try again"
          : "Copy link";

  return (
    <button
      type="button"
      onClick={onClick}
      className="invite__copy invite__copy--row"
      disabled={state === "loading"}
    >
      {label}
    </button>
  );
}

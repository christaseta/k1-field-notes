"use client";

import { useState } from "react";
import { sendInviteSms } from "@/app/actions/invite";

type State = "idle" | "loading" | "sent" | "error";

export default function SendSmsButton({
  sellerId,
  hasPhone,
}: {
  sellerId: string;
  hasPhone: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onClick() {
    setState("loading");
    setErrorMsg("");
    const result = await sendInviteSms(sellerId);
    if (result.ok) {
      setState("sent");
    } else {
      setState("error");
      setErrorMsg(result.error);
    }
    setTimeout(() => {
      setState("idle");
      setErrorMsg("");
    }, 2500);
  }

  if (!hasPhone) {
    return (
      <button
        type="button"
        className="invite__copy invite__copy--row"
        disabled
        title="No phone number on file"
      >
        No phone
      </button>
    );
  }

  const label =
    state === "loading"
      ? "Sending…"
      : state === "sent"
        ? "Sent ✓"
        : state === "error"
          ? "Failed"
          : "Send SMS";

  return (
    <button
      type="button"
      onClick={onClick}
      className="invite__copy invite__copy--row"
      disabled={state === "loading"}
      title={errorMsg || undefined}
    >
      {label}
    </button>
  );
}

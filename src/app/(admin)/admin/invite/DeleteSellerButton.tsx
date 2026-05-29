"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSeller } from "@/app/actions/invite";

type State = "idle" | "confirming" | "deleting" | "error";

export default function DeleteSellerButton({
  sellerId,
  label,
  submissionCount,
}: {
  sellerId: string;
  label: string;
  submissionCount: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  async function doDelete() {
    setState("deleting");
    const result = await deleteSeller(sellerId);
    if (!result.ok) {
      setState("error");
      setErrorMsg(result.error);
      setTimeout(() => {
        setState("idle");
        setErrorMsg("");
      }, 2500);
      return;
    }
    startTransition(() => {
      router.refresh();
    });
    setState("idle");
  }

  if (state === "confirming") {
    return (
      <span className="invite__delConfirm">
        <span className="invite__delConfirmText">
          Delete {label}?
          {submissionCount > 0 && ` (${submissionCount} submission${submissionCount === 1 ? "" : "s"} will be lost)`}
        </span>
        <button
          type="button"
          className="invite__copy invite__copy--row invite__delConfirmYes"
          onClick={doDelete}
        >
          Yes
        </button>
        <button
          type="button"
          className="invite__copy invite__copy--row"
          onClick={() => setState("idle")}
        >
          No
        </button>
      </span>
    );
  }

  const text =
    state === "deleting" || isPending
      ? "Deleting…"
      : state === "error"
        ? "Failed"
        : "Delete";
  return (
    <button
      type="button"
      onClick={() => setState("confirming")}
      className="invite__copy invite__copy--row invite__del"
      disabled={state === "deleting" || isPending}
      title={errorMsg || undefined}
    >
      {text}
    </button>
  );
}

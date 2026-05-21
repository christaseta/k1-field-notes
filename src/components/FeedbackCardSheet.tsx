"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { QuestionSet } from "@/lib/questions";
import { Sheet } from "./Sheet";
import { QuestionRunner } from "./QuestionRunner";

/**
 * Client wrapper that turns a FeedbackCard into a button which opens a bottom
 * sheet hosting the question flow. When `done`, renders children inert.
 * 
 * Supports auto-opening via `?sheet=daily` or `?sheet=weekly` query param.
 */
export function FeedbackCardSheet({
  kind,
  set,
  done,
  children,
}: {
  kind: "daily" | "weekly";
  set: QuestionSet;
  done: boolean;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Auto-open sheet if query param matches this kind
  useEffect(() => {
    const sheetParam = searchParams.get("sheet");
    if (sheetParam === kind && !done) {
      setOpen(true);
    }
  }, [searchParams, kind, done]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!done) setOpen(true);
        }}
        disabled={done && !open}
        className="block w-full text-left disabled:cursor-default"
      >
        {children}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        {open && (
          <QuestionRunner
            set={set}
            kind={kind}
            variant="sheet"
            onClose={() => setOpen(false)}
          />
        )}
      </Sheet>
    </>
  );
}

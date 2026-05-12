"use client";

import { useState } from "react";
import type { QuestionSet } from "@/lib/questions";
import { Sheet } from "./Sheet";
import { QuestionRunner } from "./QuestionRunner";

/**
 * Client wrapper that turns a FeedbackCard into a button which opens a bottom
 * sheet hosting the question flow. When `done`, renders children inert.
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
  const [open, setOpen] = useState(false);

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

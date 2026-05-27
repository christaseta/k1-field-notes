"use client";

import { useActionState, useState } from "react";
import { generateInviteLink, type InviteResult } from "@/app/actions/invite";

export default function InviteForm() {
  const [state, formAction, isPending] = useActionState<InviteResult | null, FormData>(
    generateInviteLink,
    null,
  );
  const [copied, setCopied] = useState(false);

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  }

  return (
    <div className="invite">
      <form action={formAction} className="invite__form">
        <label className="invite__label" htmlFor="email">
          Seller email
        </label>
        <div className="invite__row">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="seller@example.com"
            autoComplete="off"
            className="wf-search"
            style={{ flex: 1, minWidth: 280 }}
          />
          <button type="submit" className="invite__submit" disabled={isPending}>
            {isPending ? "Generating…" : "Generate invite link"}
          </button>
        </div>
        <p className="invite__hint">
          Creates the seller in Supabase if they don&apos;t exist yet, then returns a
          one-time sign-in URL. Single-use, expires in ~60 minutes. Share via DM.
        </p>
      </form>

      {state?.ok === false && <div className="invite__error">{state.error}</div>}

      {state?.ok === true && (
        <div className="invite__result">
          <div className="invite__resultHead">
            <span className="invite__badge">
              {state.created ? "New seller" : "Existing seller"}
            </span>
            <button
              type="button"
              onClick={() => copy(state.url)}
              className="invite__copy"
            >
              {copied ? "Copied ✓" : "Copy URL"}
            </button>
          </div>
          <code className="invite__url">{state.url}</code>
        </div>
      )}
    </div>
  );
}

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
        <div className="invite__grid">
          <label className="invite__field">
            <span className="invite__label">Name</span>
            <input
              name="display_name"
              type="text"
              placeholder="Aisha M."
              autoComplete="off"
              className="wf-search"
            />
          </label>
          <label className="invite__field">
            <span className="invite__label">Business name</span>
            <input
              name="business_name"
              type="text"
              placeholder="Café Luna"
              autoComplete="off"
              className="wf-search"
            />
          </label>
          <label className="invite__field invite__field--wide">
            <span className="invite__label">Email *</span>
            <input
              name="email"
              type="email"
              required
              placeholder="seller@example.com"
              autoComplete="off"
              className="wf-search"
            />
          </label>
        </div>
        <div className="invite__actions">
          <button type="submit" className="invite__submit" disabled={isPending}>
            {isPending ? "Generating…" : "Generate invite link"}
          </button>
          <p className="invite__hint">
            Single-use, expires in ~60 min. Share via DM. Re-inviting an existing
            seller updates their name / business if you provide values.
          </p>
        </div>
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

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
          <label className="invite__field">
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
          <label className="invite__field">
            <span className="invite__label">Phone (for SMS invite)</span>
            <input
              name="phone"
              type="tel"
              placeholder="+14155551234"
              autoComplete="off"
              className="wf-search"
            />
          </label>
        </div>
        <div className="invite__actions">
          <button type="submit" className="invite__submit" disabled={isPending}>
            {isPending ? "Generating…" : "Generate invite link"}
          </button>
          {/* Email is always sent; this hidden input makes that explicit
              and matches the per-row Copy Link button which omits it. */}
          <input type="hidden" name="send_email" value="on" />
          <p className="invite__hint">
            We&apos;ll email the magic link to this seller. Single-use, expires in
            ~60 min.
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
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {state.emailSent && (
                <span className="invite__badge" style={{ background: "var(--wf-pos)", color: "var(--market-white)" }}>
                  Email sent ✓
                </span>
              )}
              {state.emailError && (
                <span className="invite__badge" style={{ background: "var(--wf-accent-tint)", color: "var(--wf-accent)" }}>
                  Email error: {state.emailError}
                </span>
              )}
              <button
                type="button"
                onClick={() => copy(state.url)}
                className="invite__copy"
              >
                {copied ? "Copied ✓" : "Copy URL"}
              </button>
            </div>
          </div>
          <code className="invite__url">{state.url}</code>
        </div>
      )}
    </div>
  );
}

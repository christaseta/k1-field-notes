"use client";

import { useActionState, useState } from "react";
import { signInWithMagicLink, type SignInState } from "@/app/actions/auth";

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signInWithMagicLink,
    null,
  );
  const [email, setEmail] = useState("");
  const canSubmit = email.trim().length > 0 && !pending;

  return (
    <form action={formAction} className="flex flex-col flex-1 gap-5">
      <p className="text-[16px] leading-[24px] -tracking-[0.12px] text-[var(--text-strong)]">
        Enter your email below and we&apos;ll send you a magic link to log in.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[16px] leading-[24px] text-[var(--text-strong)] font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black border border-[#595959] rounded-lg px-4 py-3.5 text-[16px] leading-[24px] -tracking-[0.08px] text-[var(--text-strong)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--text-subtle)]"
        />
      </div>

      <input type="hidden" name="next" value={next} />

      {state && (
        <p
          className={`text-[13px] ${state.ok ? "text-[var(--pill-complete-fg)]" : "text-[#ff8b8b]"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <div className="mt-auto">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full min-h-[48px] px-5 py-3 rounded-full text-[16px] font-medium transition-colors bg-[#f0f0f0] ${
            canSubmit
              ? "text-[#101010] hover:bg-white"
              : "text-[#959595] cursor-not-allowed"
          }`}
        >
          {pending ? "Sending…" : "Continue"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { signInWithGoogle, signInWithMagicLink, type SignInState } from "@/app/actions/auth";

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
          className={`text-[13px] ${state.ok ? "text-[#00B23B]" : "text-[#ff8b8b]"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full min-h-[64px] px-6 rounded-full text-[16px] font-medium transition-colors bg-[#f0f0f0] ${
            canSubmit
              ? "text-[#101010] hover:bg-white"
              : "text-[#959595] cursor-not-allowed"
          }`}
        >
          {pending ? "Sending…" : "Continue"}
        </button>

        <button
          type="submit"
          formAction={signInWithGoogle}
          formNoValidate
          className="w-full min-h-[56px] px-6 rounded-full text-[14px] font-medium border border-[#595959] text-[var(--text-strong)] hover:bg-[#1a1a1a] transition-colors"
        >
          Square/Block employee? Sign in with Google
        </button>
      </div>
    </form>
  );
}

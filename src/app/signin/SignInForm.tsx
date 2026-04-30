"use client";

import { useActionState } from "react";
import { signInWithMagicLink, type SignInState } from "@/app/actions/auth";

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signInWithMagicLink,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state && (
        <p
          className={`text-sm text-center ${state.ok ? "text-emerald-700" : "text-red-700"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

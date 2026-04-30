"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsState } from "@/app/actions/settings";

const DAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

export function SettingsForm({
  displayName,
  weeklyDayPref,
}: {
  displayName: string;
  weeklyDayPref: number | null;
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateSettings,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="display_name"
          className="block text-[14px] font-medium text-[var(--text-standard)] mb-2"
        >
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={displayName}
          placeholder="What should we call you?"
          className="w-full px-4 py-3 bg-[#0e0e0e] border border-[var(--divider)] rounded-2xl text-[16px] text-[var(--text-standard)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <fieldset>
        <legend className="block text-[14px] font-medium text-[var(--text-standard)] mb-2">
          Weekly check-in day
        </legend>
        <p className="text-[12px] text-[var(--text-subtle)] mb-3">
          Pick the day you&apos;d like a reminder for the required weekly check-in.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DAYS.map((d) => {
            const checked = String(weeklyDayPref ?? "") === d.value;
            return (
              <label
                key={d.value}
                className={`flex items-center justify-center px-3 py-3 rounded-2xl cursor-pointer text-[14px] transition-colors ${
                  checked
                    ? "bg-[var(--accent)] text-[var(--text-on-accent)] font-medium"
                    : "bg-[#0e0e0e] border border-[var(--divider)] text-[var(--text-standard)] hover:bg-[#161616]"
                }`}
              >
                <input
                  type="radio"
                  name="weekly_day_pref"
                  value={d.value}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {d.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--accent)] text-[var(--text-on-accent)] py-4 rounded-2xl font-medium hover:bg-[var(--accent-strong)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>

      {state && (
        <p
          className={`text-[13px] text-center ${state.ok ? "text-[var(--pill-complete-fg)]" : "text-[#ff8b8b]"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

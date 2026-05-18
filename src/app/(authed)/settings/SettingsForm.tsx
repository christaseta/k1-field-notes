"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
  const [dayValue, setDayValue] = useState<string>(
    weeklyDayPref != null ? String(weeklyDayPref) : "",
  );
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selectedDay = DAYS.find((d) => d.value === dayValue);

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
          className="w-full px-6 min-h-[64px] bg-[#0e0e0e] border border-[var(--divider)] rounded-2xl text-[16px] text-[var(--text-standard)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label
          htmlFor="weekly_day_pref"
          className="block text-[14px] font-medium text-[var(--text-standard)] mb-2"
        >
          Weekly check-in day
        </label>
        <p className="text-[12px] text-[var(--text-subtle)] mb-3">
          Pick the day you&apos;d like a reminder for the required weekly check-in.
        </p>
        <div className="relative" ref={dropdownRef}>
          <input type="hidden" name="weekly_day_pref" value={dayValue} />
          <button
            id="weekly_day_pref"
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="w-full pl-6 pr-12 min-h-[64px] bg-[#2A2A2A] rounded-full text-[16px] text-left text-[var(--text-standard)] focus:outline-none hover:bg-[#333]"
          >
            <span className={selectedDay ? "" : "text-[var(--text-disabled)]"}>
              {selectedDay ? selectedDay.label : "Choose a day"}
            </span>
          </button>
          <span className="pointer-events-none absolute right-5 top-8 -translate-y-1/2 text-[var(--text-strong)]">
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <path
                d="M5 7.5l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {open && (
            <ul
              role="listbox"
              className="absolute z-10 left-0 right-0 mt-2 p-2 bg-[#2A2A2A] rounded-3xl shadow-lg space-y-1 max-h-72 overflow-auto"
            >
              {DAYS.map((d) => {
                const selected = d.value === dayValue;
                return (
                  <li key={d.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        setDayValue(d.value);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 min-h-[48px] rounded-full text-[16px] transition-colors ${
                        selected
                          ? "bg-white text-black"
                          : "text-[var(--text-standard)] hover:bg-[#333]"
                      }`}
                    >
                      {d.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--accent)] text-[var(--text-on-accent)] min-h-[64px] px-6 rounded-full text-[16px] font-medium hover:bg-[var(--accent-strong)] disabled:opacity-60"
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

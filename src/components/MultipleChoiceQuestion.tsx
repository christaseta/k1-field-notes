"use client";

import type { Choice } from "@/lib/questions";

type Props = {
  choices: readonly Choice[];
  value: string | null;
  onChange: (value: string) => void;
};

/**
 * Multiple-choice question rendering — a vertical stack of pill-shaped rows.
 * Selected row uses the accent color; unselected rows sit on the card surface.
 */
export function MultipleChoiceQuestion({ choices, value, onChange }: Props) {
  return (
    <div
      className="space-y-3"
      role="radiogroup"
    >
      {choices.map((c) => {
        const selected = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(c.value)}
            className={`w-full text-left px-6 min-h-[64px] rounded-full text-[16px] font-medium transition-colors ${
              selected
                ? "bg-white text-black"
                : "bg-[#2A2A2A] text-[var(--text-standard)] hover:bg-[#333]"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tags surfaced on the spontaneous note review screen. Edit freely — Research
 * owns this taxonomy. Stored as plain strings on submissions so the dashboard
 * can pivot/filter.
 */

export const SPONTANEOUS_TAGS: readonly string[] = [
  "Voice AI",
  "Customer reaction",
  "Friction",
  "Win",
  "Bug",
  "Ordering",
  "Payment",
] as const;

export type SpontaneousTag = (typeof SPONTANEOUS_TAGS)[number];

/**
 * Status pill logic for the home cards. Maps the seller's submission state
 * + their preferred weekly day into the four pill states the design supports:
 *
 *   READY      — open for submission, no time pressure
 *   DUE [DAY]  — within 2 days of (or on) their pref day
 *   OVERDUE    — past their pref day, still not submitted
 *   COMPLETE   — already submitted this period
 */

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export type StatusVariant = "ready" | "due" | "overdue" | "complete";
export type StatusPill = { variant: StatusVariant; label: string };

export function dailyStatus(submittedToday: boolean): StatusPill {
  return submittedToday
    ? { variant: "complete", label: "COMPLETE" }
    : { variant: "ready", label: "READY" };
}

export function weeklyStatus(
  submittedThisWeek: boolean,
  preferredDay: number | null,
  now = new Date(),
): StatusPill {
  if (submittedThisWeek) return { variant: "complete", label: "COMPLETE" };
  if (preferredDay === null || preferredDay === undefined) {
    return { variant: "ready", label: "READY" };
  }

  const today = now.getDay();
  // Days remaining until the preferred day (0 = today).
  const daysUntil = (preferredDay - today + 7) % 7;
  // Days since the preferred day passed this week (0 = today, 1 = yesterday…).
  const daysSince = (today - preferredDay + 7) % 7;

  if (daysUntil === 0) {
    return { variant: "due", label: `DUE ${DAY_LABELS[preferredDay]}` };
  }
  if (daysUntil <= 2) {
    return { variant: "due", label: `DUE ${DAY_LABELS[preferredDay]}` };
  }
  // The pref day has come and gone; treat as overdue until the new week starts.
  if (daysSince > 0 && daysSince <= 4) {
    return { variant: "overdue", label: "OVERDUE" };
  }
  return { variant: "ready", label: "READY" };
}

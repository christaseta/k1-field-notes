/**
 * Status pill logic for the home cards. Maps the seller's submission state
 * + their preferred weekly day into the four pill states the design supports:
 *
 *   READY      — open for submission, no time pressure
 *   DUE [DAY]  — within 2 days of (or on) their pref day
 *   OVERDUE    — past their pref day, still not submitted
 *   COMPLETE   — already submitted this period
 */

export type StatusVariant = "ready" | "due" | "overdue" | "complete";
export type StatusPill = { variant: StatusVariant; label: string };

export function dailyStatus(submittedToday: boolean): StatusPill {
  return submittedToday
    ? { variant: "complete", label: "COMPLETE" }
    : { variant: "ready", label: "READY" };
}

export function weeklyStatus(
  submittedThisWeek: boolean,
  _preferredDay: number | null,
  now = new Date(),
): StatusPill {
  if (submittedThisWeek) return { variant: "complete", label: "COMPLETE" };
  // Friday is day 5; weeks reset Sunday, so Saturday is the only day the
  // weekly check-in can be late without rolling into the next period.
  if (now.getDay() === 6) return { variant: "overdue", label: "OVERDUE" };
  return { variant: "due", label: "DUE FRIDAY" };
}

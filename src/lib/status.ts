/**
 * Status pill logic for the home cards. Maps the seller's submission state
 * into the pill states the design supports:
 *
 *   READY              — open for submission, no time pressure
 *   COMPLETE BY SUNDAY — weekly is open and due by end of Sunday
 *   COMPLETE           — already submitted this period
 *
 * Weeks reset on Sunday, so a weekly check-in is either open (due by
 * Sunday) or complete — there is no in-week overdue state.
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
  _now = new Date(),
): StatusPill {
  if (submittedThisWeek) return { variant: "complete", label: "COMPLETE" };
  return { variant: "due", label: "COMPLETE BY SUNDAY" };
}

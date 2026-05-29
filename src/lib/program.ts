/**
 * Program metadata. Update PROGRAM_START_DATE once the actual cohort start
 * is locked. The brief says 3+ weeks; we're scoping for 5.
 */

export const PROGRAM_NAME = "Square Kiosk Alpha";
export const PROGRAM_WEEKS = 5;
// Cohort start: Monday June 1, 2026 (US Pacific). Program runs 5 weeks
// through Sunday July 5, 2026.
export const PROGRAM_START_DATE = new Date("2026-06-01T00:00:00-07:00");

const DAY_MS = 24 * 60 * 60 * 1000;

/** 1-indexed program week. Returns 1 before the program starts and capped at PROGRAM_WEEKS. */
export function currentProgramWeek(now = new Date()): number {
  const elapsed = now.getTime() - PROGRAM_START_DATE.getTime();
  if (elapsed < 0) return 1;
  const week = Math.floor(elapsed / (7 * DAY_MS)) + 1;
  return Math.min(Math.max(week, 1), PROGRAM_WEEKS);
}

export function programLabel(now = new Date()): string {
  return `${PROGRAM_NAME} · Week ${currentProgramWeek(now)} of ${PROGRAM_WEEKS}`;
}

export function timeOfDayGreeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

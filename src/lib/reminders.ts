import type { Reminder } from "./types";

/** Cumulative schedule: each reminder's days count from the previous step (send, then previous reminder). */
export function reminderSchedule(rem: Pick<Reminder, "days" | "enabled">[]) {
  let day = 0;
  return rem.map((r) => {
    day += r.days;
    return { day, enabled: r.enabled };
  });
}

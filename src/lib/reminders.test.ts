import { describe, expect, it } from "vitest";
import { reminderSchedule } from "./reminders";

describe("reminder schedule", () => {
  it("counts each delay from the previous step (3, then 4, then 8 days → J+3, J+7, J+15)", () => {
    const s = reminderSchedule([{ days: 3, enabled: true }, { days: 4, enabled: true }, { days: 8, enabled: true }]);
    expect(s.map((x) => x.day)).toEqual([3, 7, 15]);
  });
});

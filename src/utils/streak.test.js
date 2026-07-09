import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { computeStreak } from "./streak";

// Helper: fix "now" so results are deterministic
function setNow(isoString) {
  vi.setSystemTime(new Date(isoString));
}

describe("computeStreak", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a streak of 1 on the very first play (no lastPlayDate)", () => {
    setNow("2026-07-09T10:00:00.000Z");
    const { streak, today } = computeStreak(null, 0);
    expect(streak).toBe(1);
    expect(today).toBe(new Date().toISOString());
  });

  it("keeps the streak unchanged when playing again the same calendar day", () => {
    setNow("2026-07-09T22:00:00.000Z");
    const lastPlay = "2026-07-09T08:00:00.000Z"; // earlier same day
    const { streak } = computeStreak(lastPlay, 5);
    expect(streak).toBe(5);
  });

  it("treats a same-day replay as streak 1 if the streak was previously 0", () => {
    setNow("2026-07-09T22:00:00.000Z");
    const lastPlay = "2026-07-09T08:00:00.000Z";
    const { streak } = computeStreak(lastPlay, 0);
    expect(streak).toBe(1);
  });

  it("increments the streak when playing on the very next calendar day", () => {
    setNow("2026-07-10T09:00:00.000Z");
    const lastPlay = "2026-07-09T23:30:00.000Z"; // late the prior day
    const { streak } = computeStreak(lastPlay, 4);
    expect(streak).toBe(5);
  });

  it("resets to 1 when exactly one full day is missed (gap of 2 calendar days)", () => {
    setNow("2026-07-11T09:00:00.000Z");
    const lastPlay = "2026-07-09T09:00:00.000Z";
    const { streak } = computeStreak(lastPlay, 10);
    expect(streak).toBe(1);
  });

  it("resets to 1 when 3+ days are missed", () => {
    setNow("2026-07-20T09:00:00.000Z");
    const lastPlay = "2026-07-09T09:00:00.000Z";
    const { streak } = computeStreak(lastPlay, 10);
    expect(streak).toBe(1);
  });

  it("only looks at calendar date, not time of day, for the same-day case", () => {
    setNow("2026-07-09T23:55:00.000Z"); // late in the day
    const lastPlay = "2026-07-09T00:01:00.000Z"; // early in the same day
    const { streak } = computeStreak(lastPlay, 3);
    expect(streak).toBe(3);
  });

  it("does not mutate or depend on currentStreak when starting fresh", () => {
    setNow("2026-07-09T10:00:00.000Z");
    const result1 = computeStreak(null, 99); // currentStreak should be ignored on first play
    expect(result1.streak).toBe(1);
  });
});
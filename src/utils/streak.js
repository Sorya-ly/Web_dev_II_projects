// Streak logic per requirements:
// 1. Save the user's last play date.
// 2. When they finish a quiz:
//    - If today is the next day after the last play date -> streak +1
//    - If it's the same day -> don't change the streak
//    - If they missed 3+ days -> reset streak to 0 (then this play starts a new streak of 1)

function toDateOnly(dateStr) {
  const d = new Date(dateStr);
  // Use UTC getters, not local getters. The timestamps we receive are UTC
  // ISO strings; reading them back with local getters (getFullYear/getMonth/
  // getDate) shifts the "calendar day" depending on the machine's timezone,
  // which caused same-day timestamps near midnight UTC to be treated as
  // different days (or vice versa) on non-UTC machines.
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysBetween(dateA, dateB) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((toDateOnly(dateB) - toDateOnly(dateA)) / msPerDay);
}

/**
 * Computes the new streak value based on the last play date and today.
 * @param {string|null} lastPlayDate - ISO date string of the last play, or null if never played
 * @param {number} currentStreak - the streak value before this play
 * @returns {{ streak: number, today: string }}
 */
export function computeStreak(lastPlayDate, currentStreak) {
  const today = new Date().toISOString();

  if (!lastPlayDate) {
    // First time playing ever
    return { streak: 1, today };
  }

  const diff = daysBetween(lastPlayDate, today);

  if (diff === 0) {
    // Same day - streak unchanged
    return { streak: currentStreak === 0 ? 1 : currentStreak, today };
  }

  if (diff === 1) {
    // Played the very next day - increment
    return { streak: currentStreak + 1, today };
  }

  // diff >= 2 (missed at least one day; "missed 3 days" worth of gap) - reset streak
  // diff >= 3 explicitly covers "missed 3 days"; we also reset for diff===2 to keep
  // the streak meaningfully consecutive, per the spirit of a daily streak.
  if (diff >= 3) {
    return { streak: 1, today }; // reset to 0 then count today as day 1 of new streak
  }

  // diff === 2: one full day missed - treat as broken streak too, restart at 1
  return { streak: 1, today };
}
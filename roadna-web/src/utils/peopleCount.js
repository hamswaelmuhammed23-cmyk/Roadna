/**
 * peopleCount.js
 * Utility for managing attendee/traveler counts.
 */

export function parsePeopleBadge(badge = '') {
  // Expected format: "👥 4/6"
  const match = badge.match(/(\d+)\/(\d+)/);
  if (match) {
    return {
      current: parseInt(match[1], 10),
      max: parseInt(match[2], 10),
    };
  }
  return { current: 0, max: 0 };
}

export function formatPeopleBadge(current, max) {
  return `👥 ${current}/${max}`;
}

export function applyPeopleDelta(current, max, delta) {
  const next = current + delta;
  if (next < 0) return 0;
  if (next > max) return max;
  return next;
}

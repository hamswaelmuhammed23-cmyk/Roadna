/**
 * searchNav.js
 * Utility for mapping search queries to destinations and sections.
 */

const DESTINATIONS_MAP = [
  { keywords: ['cairo', 'pyramids', 'history'], label: 'Cairo', emoji: '🏛️', section: '.sec2' },
  { keywords: ['luxor', 'temple', 'ancient'], label: 'Luxor', emoji: '🐫', section: '.sec2' },
  { keywords: ['aswan', 'nile', 'cruise'], label: 'Aswan', emoji: '🚤', section: '.sec2' },
  { keywords: ['dahab', 'dive', 'sea', 'beach'], label: 'Dahab', emoji: '🌊', section: '.sec2' },
  { keywords: ['trip', 'travel', 'backpack'], label: 'Upcoming Trips', emoji: '🎒', section: '.sec3' },
  { keywords: ['event', 'party', 'join'], label: 'Events', emoji: '🎭', section: '.sec4' },
  { keywords: ['sharm', 'dive', 'resort'], label: 'Sharm El Sheikh', emoji: '🐬', section: '.sec2' },
];

export function findDestination(query) {
  const q = query.toLowerCase();
  return DESTINATIONS_MAP.find((d) => 
    d.keywords.some((kw) => q.includes(kw))
  );
}

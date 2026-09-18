/**
 * TripsGrid.jsx
 *
 * Full-width, 3-column grid showing all trips (unfiltered).
 * Used in the "Explore more trips" section.
 *
 * Props:
 *   trips   — full trips array
 *   onView  — (tripId) => void
 */

import { useState } from 'react'
import ExploreTripCard from './ExploreTripCard'

const ALL_TAGS = [
  'All',
  'Medical',
  'Entertainment',
  'Business',
  'Culture',
  'Sport',
  'Education',
  'Music',
  'Art',
  'Trade Show',
  'Technology',
  'Adventure',
]

export default function TripsGrid({ trips = [], onView }) {
  const [activeTag, setActiveTag] = useState('All')

  const filtered =
    activeTag === 'All'
      ? trips
      : trips.filter((t) => t.tags.includes(activeTag))

  return (
    <section id="explore-more-trips" className="mb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-800">Explore more trips</h2>
          </div>
          <p className="text-sm text-gray-400 ml-9">Discover all available destinations</p>
        </div>

        <span className="text-xs text-gray-400 font-medium">
          {filtered.length} trip{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tag filter pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-5"
        style={{ scrollbarWidth: 'none' }}
      >
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            id={`filter-${tag.toLowerCase()}`}
            onClick={() => setActiveTag(tag)}
            className={`flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
              activeTag === tag
                ? 'bg-[#2F80ED] text-white shadow-md scale-105'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#4CB8E7] hover:text-[#2F80ED]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No trips found for <strong>{activeTag}</strong></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trip) => (
            <ExploreTripCard
              key={trip.id}
              trip={trip}
              onView={() => onView?.(trip.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

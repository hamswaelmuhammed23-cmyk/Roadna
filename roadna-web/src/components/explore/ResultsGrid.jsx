/**
 * ResultsGrid.jsx
 *
 * Displays filtered results in a grid layout.
 * Shows both trips and events based on applied filters.
 */
import { Link } from 'react-router-dom'
import ExploreTripCard from './ExploreTripCard'
//import { useScrollRevealList } from '../../hooks/useScrollReveal'
import { Search } from 'lucide-react'

export default function ResultsGrid({
  items,
  isFiltering,
  onViewTrip,
  onViewEvent,
  onClearFilters
}) {
  //const gridRef = useScrollRevealList({ staggerMs: 60 })

  if (!isFiltering) return null

  if (items.length === 0) {
    return (
      <div className="text-center py-24 glass-panel rounded-[40px] border-dashed border-2 border-gray-200/50 max-w-2xl mx-auto my-12 animate-fade-in-up">
        <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center shadow-inner animate-floating">
          <Search size={40} className="text-[#2F80ED] opacity-60" />
        </div>
        <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">Your next adventure is waiting ✨</h3>
        <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
          We couldn't find exactly what you were looking for, but the horizon is wide! Try adjusting your filters to discover something new.
        </p>
        <button
          onClick={onClearFilters}
          className="btn-premium bg-gradient-to-r from-[#4CB8E7] to-[#2F80ED] text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-blue-300 transition-all active:scale-95"
        >
          Clear Filters & Explore
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Filtered Results ({items.length})
        </h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-[#2F80ED] hover:text-[#4CB8E7] font-medium transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <div key={`${item.type}-${item.id}`} style={{ opacity: 1 }}>
            <ExploreTripCard
              trip={{
                ...item,
                duration: item.type === 'trip' ? item.duration : item.date,
                travelers: item.type === 'trip' ? item.travelers : (item.attendeeCount || 8),
              }}
              onView={() => item.type === 'trip' ? onViewTrip(item.id) : onViewEvent(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

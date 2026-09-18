/**
 * FilterSection.jsx
 *
 * Horizontal pill-based filter panel:
 *  - Categories listed horizontally (wrapped)
 *  - Selected category expands a panel below showing tags in a responsive grid
 *  - Tags use circle radio-style selectors (○ / ●)
 *  - Multi-select tags supported
 *  - Active filters strip at the bottom
 */

import { useState, useEffect, useRef } from 'react'
import { CategoryIcon } from '../../utils/categoryIcons'

// No longer needed here as it's in utility, but I'll keep the variable name for logic if needed or just remove it.
// Actually, let's just remove the hardcoded emojis.

/* ── Tag with circle selector ─────────────────────────────────── */
function TagCircle({ tag, selected, onClick, delay = 0 }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <button
      onClick={onClick}
      style={{
        opacity:   mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(6px)',
        transition: `opacity 0.22s ease ${delay}ms, transform 0.22s ease ${delay}ms`,
      }}
      className={[
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
        'border transition-all duration-200 cursor-pointer select-none text-left active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CB8E7]/50',
        selected
          ? 'bg-[#EAF6FD] border-[#4CB8E7] text-[#2F80ED] font-semibold'
          : 'bg-white border-gray-200 text-[#2F80ED] hover:border-[#4CB8E7]/50 hover:bg-[#f7fbff]',
      ].join(' ')}
    >
      {/* Circle indicator */}
      <span
        className={[
          'flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          selected
            ? 'border-[#4CB8E7] bg-[#4CB8E7]'
            : 'border-gray-300 bg-white',
        ].join(' ')}
      >
        {selected && (
          <span className="w-1.5 h-1.5 rounded-full bg-white block" />
        )}
      </span>
      {tag}
    </button>
  )
}

/* ── Small remove badge ───────────────────────────────────────── */
function ActiveBadge({ label, icon, onRemove, accent = false }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        accent
          ? 'bg-[#4CB8E7] text-white'
          : 'bg-[#EAF6FD] text-[#2F80ED] border border-[#4CB8E7]/30',
      ].join(' ')}
    >
      {icon}
      {label}
      <button
        onClick={onRemove}
        className="hover:opacity-60 transition-all duration-200 flex items-center active:scale-90 cursor-pointer"
        aria-label={`Remove ${label}`}
      >
        <svg viewBox="0 0 10 10" width="8" height="8" fill="currentColor">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function FilterSection({
  categories,
  categoryTags,
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagsChange,
  onClearFilters,
}) {
  // Track which category's tag panel is currently rendered (for animation)
  const prevCategory = useRef(selectedCategory)

  useEffect(() => {
    if (selectedCategory !== prevCategory.current) {
      prevCategory.current = selectedCategory
    }
  }, [selectedCategory])

  const handleCategoryClick = (cat) => {
    const next = selectedCategory === cat ? '' : cat
    onCategoryChange(next)
    onTagsChange([])
  }

  const handleTagToggle = (tag) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    )
  }

  const hasActiveFilters = !!selectedCategory || selectedTags.length > 0
  const tags = selectedCategory ? (categoryTags[selectedCategory] || []) : []
  const active = !!selectedCategory

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-[#4CB8E7]">Filter by Preference</h2>
          <p className="text-xs text-gray-400 mt-0.5">Choose a category, then pick tags</p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-[#2F80ED] hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Horizontal Categories ────────────────────────────────── */}
      <div className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            // icon removed as it's handled by CategoryIcon component below
            
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 select-none border active:scale-95 cursor-pointer',
                  isSelected
                    ? 'bg-[#EAF6FD] border-[#4CB8E7] text-[#2F80ED] shadow-sm'
                    : 'bg-white border-gray-200 text-[#2F80ED] hover:border-[#4CB8E7]/50 hover:bg-[#f7fbff]'
                ].join(' ')}
              >
                  <span className="flex items-center gap-2">
                    {/* Selection pill indicator */}
                    <span
                      className={[
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                        isSelected
                          ? 'border-[#4CB8E7] bg-[#4CB8E7]'
                          : 'border-gray-300 bg-white',
                      ].join(' ')}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                    </span>

                    <span className="flex items-center gap-2">
                      <CategoryIcon category={cat} className={`w-4 h-4 ${isSelected ? 'text-[#2F80ED]' : 'text-[#2F80ED]/70'}`} />
                      {cat}
                    </span>
                    
                    {/* Tag count badge */}
                    {isSelected && selectedTags.length > 0 && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-[#4CB8E7] text-white font-bold">
                        {selectedTags.length}
                      </span>
                    )}
                  </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tags panel — slide open when a category is active ──── */}
      <div
        style={{
          maxHeight: active ? `${Math.ceil(tags.length / 3) * 52 + 40}px` : '0',
          opacity: active ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
        }}
      >
        <div className="px-6 pb-5 pt-2 border-t border-gray-50 bg-[#F7FBFF]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tags.map((tag, i) => (
              <TagCircle
                key={`${selectedCategory}-${tag}`}
                tag={tag}
                selected={selectedTags.includes(tag)}
                onClick={() => handleTagToggle(tag)}
                delay={i * 25}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Active filters strip ─────────────────────────────────── */}
      <div
        style={{
          maxHeight: hasActiveFilters ? '120px' : '0',
          opacity: hasActiveFilters ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.25s ease',
        }}
      >
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Active:
            </span>
            {selectedCategory && (
              <ActiveBadge
                label={selectedCategory}
                icon={<CategoryIcon category={selectedCategory} className="w-3 h-3" />}
                accent
                onRemove={() => { onCategoryChange(''); onTagsChange([]) }}
              />
            )}
            {selectedTags.map((tag) => (
              <ActiveBadge
                key={tag}
                label={tag}
                onRemove={() => handleTagToggle(tag)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

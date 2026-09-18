import { useState, useRef, useEffect, useCallback, Children } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CarouselSlider({ children, itemWidth = 312, listRef }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const childCount = Children.count(children)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    
    const index = Math.round(el.scrollLeft / itemWidth)
    setActiveIndex(index)
  }, [itemWidth])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * itemWidth, behavior: 'smooth' })
  }

  // Calculate number of dots based on total scrollable width
  const visibleItems = scrollRef.current ? Math.floor(scrollRef.current.clientWidth / itemWidth) : 1;
  const maxDots = Math.max(1, childCount - visibleItems + 1)
  const displayDots = Math.min(activeIndex, maxDots - 1)

  return (
    <div className="relative group">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 ${
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scroll container */}
      <div
        ref={(node) => {
          scrollRef.current = node
          if (typeof listRef === 'function') listRef(node)
          else if (listRef) listRef.current = node
        }}
        className="flex gap-6 overflow-x-auto pb-4 items-stretch px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
        }}
      >
        {Children.map(children, (child) => (
          <div style={{ scrollSnapAlign: 'start' }}>
            {child}
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: maxDots }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              displayDots === idx ? 'w-6 bg-[#2F80ED]' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Hide webkit scrollbar */}
      <style>{`
        div[style*="scrollbarWidth: none"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

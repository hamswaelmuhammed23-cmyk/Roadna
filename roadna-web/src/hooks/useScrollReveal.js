/**
 * useScrollReveal.js
 *
 * Custom hook that uses IntersectionObserver to trigger a CSS class
 * when an element enters the viewport, creating scroll-reveal animations.
 *
 * Usage:
 *   const ref = useScrollReveal()
 *   <div ref={ref} className="reveal-card"> ... </div>
 *
 * Options:
 *   threshold  - 0–1, how much of the element must be visible (default 0.12)
 *   rootMargin - IntersectionObserver rootMargin (default '-20px')
 */
import { useEffect, useRef } from 'react'

export default function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { threshold = 0.12, rootMargin = '0px 0px -20px 0px' } = options

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('sr-visible')
          observer.unobserve(el) // animate only once
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}

/**
 * useScrollRevealList
 *
 * Returns a ref-setter and a stagger delay calculator.
 * Attach containerRef to the parent; children with data-sr-index get
 * animated with progressive delay.
 *
 * Usage:
 *   const containerRef = useScrollRevealList()
 *   <div ref={containerRef}>
 *     {items.map((item, i) => (
 *       <div key={i} data-sr-index={i} className="reveal-card"> ... </div>
 *     ))}
 *   </div>
 */
export function useScrollRevealList(options = {}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const { threshold = 0.08, rootMargin = '0px 0px -20px 0px', staggerMs = 80 } = options

    const children = container.querySelectorAll('[data-sr-index]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.srIndex || '0', 10)
            setTimeout(() => {
              entry.target.classList.add('sr-visible')
            }, idx * staggerMs)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    children.forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return containerRef
}

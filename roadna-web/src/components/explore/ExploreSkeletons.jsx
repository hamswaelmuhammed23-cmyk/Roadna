/**
 * ExploreSkeletons.jsx
 *
 * Skeleton loading placeholders for the Explore page sections.
 * Shown while data is being fetched/computed.
 */

/** Pulse shimmer for a single trip/event card */
export function SkeletonCard() {
  return (
    <div
      style={{
        width: 288,
        flexShrink: 0,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image area */}
      <div className="h-44 w-full animate-shimmer" />

      {/* Body */}
      <div style={{ padding: 16 }}>
        {/* Title */}
        <div className="h-4 w-3/4 rounded-lg mb-3 animate-shimmer" />
        {/* Tags row */}
        <div className="flex gap-2 mb-4">
          {[52, 68, 44].map((w, i) => (
            <div key={i} style={{ width: w }} className="h-5 rounded-full animate-shimmer" />
          ))}
        </div>
        {/* Avatar row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white animate-shimmer" />
            ))}
          </div>
          <div className="h-3 w-14 rounded-lg animate-shimmer" />
        </div>
        {/* Footer row */}
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="h-3 w-16 rounded-lg animate-shimmer" />
          <div className="h-8 w-16 rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

/** A row of 4 skeleton cards */
export function SkeletonCardRow({ count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'hidden', paddingBottom: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/** Skeleton for a section header (title + subtitle) */
export function SkeletonSectionHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'skeletonShimmer 1.4s ease infinite' }} />
        <div>
          <div style={{ height: 20, width: 180, borderRadius: 6, marginBottom: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'skeletonShimmer 1.4s ease infinite 0.1s' }} />
          <div style={{ height: 12, width: 120, borderRadius: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'skeletonShimmer 1.4s ease infinite 0.2s' }} />
        </div>
      </div>
      <div style={{ height: 16, width: 96, borderRadius: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'skeletonShimmer 1.4s ease infinite 0.15s' }} />
    </div>
  )
}

/** Full section skeleton (header + cards) */
export function SkeletonSection({ cardCount = 4 }) {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
      <SkeletonSectionHeader />
      <SkeletonCardRow count={cardCount} />
    </section>
  )
}

/** Inject keyframes once */
export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skeletonShimmer {
        0%   { background-position: 100% 0 }
        100% { background-position: -100% 0 }
      }
    `}</style>
  )
}

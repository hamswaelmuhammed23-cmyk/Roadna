/**
 * ExploreTripCard.jsx
 *
 * A rich trip card for the Explore page.
 * Used in both the horizontal-scroll recommended section and the full grid.
 *
 * Props:
 *   trip    — { id, title, location, image, duration, travelers, tags, rating }
 *   onView  — callback when "View Trip" is clicked
 *   compact — if true, renders in a narrower fixed-width format (for scroll row)
 */
import { Clock, MapPin } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { tripDetailsMap, eventDetailsMap } from '../../data/tripDetailsData'
import CinematicReveal from '../cinematic/CinematicReveal'

// ── Transition helpers ─────────────────────────────────────────────────────
// Museum transition ONLY fires for events/trips categorized as Culture, Arts, or Documentary.
// This prevents general entertainment/comedy/sports/adventure from falsely triggering it.
const MUSEUM_CATEGORIES = new Set(['culture', 'cultural', 'arts', 'documentary'])
const MUSEUM_STRICT_TAGS = new Set(['culture', 'cultural', 'heritage', 'museum', 'history', 'historical', 'ancient'])

function getTransitionType(title = '', category = '', tags = []) {
  const lowCategory = (category || '').toLowerCase()

  // 1. If explicit category is provided, use it strictly.
  if (lowCategory) {
    if (MUSEUM_CATEGORIES.has(lowCategory)) {
      return 'museum'
    }
    return 'portal'
  }

  // 2. Otherwise fallback to title keywords & tags (for safety and backward compatibility)
  const lowTitle = (title || '').toLowerCase()
  const lowTags = (tags || []).map(t => t.toLowerCase())

  const hasMuseumKeyword =
    lowTitle.includes('museum') ||
    lowTitle.includes('culture') ||
    lowTitle.includes('cultural') ||
    lowTitle.includes('heritage') ||
    lowTitle.includes('ancient') ||
    lowTitle.includes('monuments') ||
    lowTitle.includes('pharaoh') ||
    lowTitle.includes('pyramids') ||
    lowTitle.includes('petra') ||
    lowTitle.includes('luxor') ||
    lowTitle.includes('aswan') ||
    lowTitle.includes('temple') ||
    lowTitle.includes('nubian') ||
    lowTitle.includes('history') ||
    lowTitle.includes('historic')

  if (hasMuseumKeyword) return 'museum'
  if (lowTags.some(t => MUSEUM_STRICT_TAGS.has(t))) return 'museum'

  return 'portal'
}

// ── Quick Museum Door Transition (700ms canvas) ────────────────────────────
function MuseumDoorTransition({ onComplete }) {
  const ref = useRef(null)
  const cbRef = useRef(onComplete)
  cbRef.current = onComplete

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const start = performance.now()
    let animId

    const draw = (now) => {
      const t = (now - start) / 1000
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      if (t >= 0.85) {
        cancelAnimationFrame(animId)
        canvas.style.display = 'none'
        cbRef.current?.()
        return
      }

      const fadeIn = Math.min(1, t / 0.18)
      // Sky background
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, `rgba(2,8,16,${fadeIn})`)
      sky.addColorStop(1, `rgba(12,32,64,${fadeIn})`)
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      if (t > 0.08) {
        const zoomStart = 0.28, zoomEnd = 0.72
        const zp = t > zoomStart ? Math.min(1, (t - zoomStart) / (zoomEnd - zoomStart)) : 0
        const eased = zp * zp * zp
        const drawAlpha = Math.min(1, (t - 0.08) / 0.14)

        ctx.save()
        ctx.translate(W * 0.5, H * 0.48)
        ctx.scale(1 + eased * 12, 1 + eased * 12)
        ctx.translate(-W * 0.5, -H * 0.48)

        // Ground
        ctx.fillStyle = `rgba(22,18,10,${drawAlpha})`
        ctx.fillRect(0, H * 0.67, W, H * 0.33)

          // Columns
          ;[0.12, 0.23, 0.34, 0.66, 0.77, 0.88].forEach(cx => {
            const cg = ctx.createLinearGradient(W * cx, 0, W * (cx + 0.05), 0)
            cg.addColorStop(0, `rgba(58,44,20,${drawAlpha})`)
            cg.addColorStop(0.5, `rgba(138,112,64,${drawAlpha})`)
            cg.addColorStop(1, `rgba(58,44,20,${drawAlpha})`)
            ctx.fillStyle = cg
            ctx.fillRect(W * cx - W * 0.025, H * 0.26, W * 0.05, H * 0.41)
          })

        // Top beam
        ctx.fillStyle = `rgba(80,64,32,${drawAlpha})`
        ctx.fillRect(W * 0.10, H * 0.238, W * 0.80, H * 0.026)
        ctx.fillStyle = `rgba(98,78,40,${drawAlpha})`
        ctx.fillRect(W * 0.08, H * 0.213, W * 0.84, H * 0.025)

        // Egyptian sun disk
        ctx.fillStyle = `rgba(212,184,112,${drawAlpha})`
        ctx.beginPath()
        ctx.ellipse(W * 0.5, H * 0.226, W * 0.042, H * 0.014, 0, 0, Math.PI * 2)
        ctx.fill()

        // Door (dark rectangle)
        ctx.fillStyle = `rgba(1,3,10,${drawAlpha})`
        ctx.fillRect(W * 0.425, H * 0.295, W * 0.15, H * 0.385)
        ctx.strokeStyle = `rgba(220,195,140,${0.65 * drawAlpha})`
        ctx.lineWidth = W * 0.005
        ctx.strokeRect(W * 0.425, H * 0.295, W * 0.15, H * 0.385)

        // Door golden glow growing as we zoom in
        const doorGlow = ctx.createRadialGradient(W * 0.5, H * 0.48, 0, W * 0.5, H * 0.48, W * 0.14)
        doorGlow.addColorStop(0, `rgba(220,180,100,${(0.25 + eased * 0.4) * drawAlpha})`)
        doorGlow.addColorStop(1, 'rgba(220,180,100,0)')
        ctx.fillStyle = doorGlow
        ctx.fillRect(W * 0.3, H * 0.18, W * 0.4, H * 0.64)

        ctx.restore()
      }

      // Fade to black (door fully opens)
      if (t > 0.62) {
        const blackAlpha = Math.min(1, (t - 0.62) / 0.23)
        ctx.fillStyle = `rgba(2,8,16,${blackAlpha})`
        ctx.fillRect(0, 0, W, H)
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return createPortal(
    <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 99999, display: 'block' }} />,
    document.body
  )
}



function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {half && (
        <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-grad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#d1d5db" />
            </linearGradient>
          </defs>
          <path fill="url(#half-grad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="w-3 h-3 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </span>
  )
}

export default function ExploreTripCard({ trip, onView, compact = false }) {
  const { title, location, image, duration, travelers, tags = [], rating } = trip
  const [showConfirm, setShowConfirm] = useState(false)
  const [showMuseumTransition, setShowMuseumTransition] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const [imgRect, setImgRect] = useState(null)
  const imgRef = useRef(null)
  const navigate = useNavigate()
  const currentLocation = useLocation()
  const isEvent = typeof trip.id === 'string' && trip.id.startsWith('e')
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleJoinClick = () => setShowConfirm(true)

  // Navigation for museum trips: pass cinematicType so TripDetails shows the overlay

  const doNavigate = (isMuseum = false) => {
    if (onView) {
      onView()  // ← uses the handler from Explore.jsx which passes real data
    }
  }
  const handleConfirm = () => {
    setShowConfirm(false)
    const type = getTransitionType(title, trip.category || '', tags)

    if (type === 'museum') {
      // Quick museum door canvas (700ms), then navigate WITH cinematicType flag
      setShowMuseumTransition(true)
    } else {
      // Cinematic Reveal: fullscreen image + title, then navigate (no museum flag)
      if (imgRef.current) {
        setImgRect(imgRef.current.getBoundingClientRect())
      }
      setShowReveal(true)
    }
  }

  const handleCancel = () => setShowConfirm(false)

  return (
    <>
      {/* Museum door transition (cultural/arts/documentary events only) */}
      {showMuseumTransition && (
        <MuseumDoorTransition onComplete={() => doNavigate(true)} />
      )}

      {/* Cinematic Reveal (all other trips/events) */}
      {showReveal && (
        <CinematicReveal
          image={image || trip.image || ''}
          title={title}
          rect={imgRect}
          onComplete={() => doNavigate(false)}
        />
      )}

      <div
        className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden premium-hover flex flex-col ${compact ? 'w-72 flex-shrink-0' : 'w-full h-full'
          }`}
      >
        {/* Image */}
        {!showReveal && (
          <div className="relative h-44 overflow-hidden bg-gray-100">
            <img
              ref={imgRef}
              src={image || "/images/Picnic.jpg"}
              alt={title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 image-reveal ${imgLoaded ? 'loaded' : ''}`}
              onError={(e) => {
                if (!e.target.dataset.fallbackSet) {
                  e.target.dataset.fallbackSet = 'true';
                  e.target.src = '/images/Picnic.jpg';
                }
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {/* Duration badge */}
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#2F80ED]" /> {duration}
            </span>
            {/* Rating badge */}
            {rating && (
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow">
                <StarRating rating={rating} />
              </span>
            )}
            {/* Location on image */}
            <p className="absolute bottom-3 left-3 text-white text-xs font-medium drop-shadow flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {location}
            </p>
          </div>
        )}



        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{title}</h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-1 bg-[#f0f7ff] text-[#2F80ED] rounded-full font-bold uppercase tracking-wider tag-hover cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Joined users preview */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((index) => (
                <img
                  key={index}
                  src={`https://i.pravatar.cc/40?u=${trip.id}-${index}`}
                  alt={`User ${index + 1}`}
                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80"
                  }}
                />
              ))}
            </div>
            {travelers > 3 && (
              <span className="text-sm text-gray-500">+{Math.max(0, travelers - 3)} joined</span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {travelers} travelers
            </span>

            <button
              id={`view-trip-${trip.id}`}
              onClick={handleJoinClick}
              className="btn-premium text-xs font-bold text-[#2F80ED] bg-[#f0f7ff] hover:bg-[#2F80ED] hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-blue-200"
            >
              View &rarr;
            </button>
          </div>
        </div>

        {/* ── Confirm Modal (now inline inside card area) ── */}
        {showConfirm && (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 999,
              background: 'rgba(2,10,24,0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 16,
            }}
            onClick={handleCancel}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0f1a2e',
                border: '1px solid rgba(56,189,248,0.3)',
                borderRadius: 20,
                padding: '24px 20px',
                maxWidth: 260,
                width: '85%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                textAlign: 'center',
                animation: 'fadeup 0.3s ease-out both',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{isEvent ? '🎫' : '✈️'}</div>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                {isEvent ? 'View event?' : 'View trip?'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 20, lineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={handleConfirm}
                  style={{
                    width: '100%', padding: '10px 0',
                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                    border: 'none', borderRadius: 10,
                    color: '#fff', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Let's Go! 🚀
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    width: '100%', padding: '8px 0',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#64748b',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portal transition keyframe */}
      <style>{`
      @keyframes portalOverlayIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `}</style>
    </>
  )
}

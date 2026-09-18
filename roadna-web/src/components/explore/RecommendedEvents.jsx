/**
 * RecommendedEvents.jsx
 *
 * Horizontally scrollable row of event cards personalized for the user.
 * Clicking "View →" shows the same confirm modal + Museum/Cinematic
 * transition as ExploreTripCard, then navigates to TripDetails.
 */
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import CinematicReveal from '../cinematic/CinematicReveal'
import CarouselSlider from './CarouselSlider'

// ── Transition helpers (same rules as ExploreTripCard) ─────────────────────
const MUSEUM_CATEGORIES = new Set(['culture', 'cultural', 'arts', 'documentary'])
const MUSEUM_STRICT_TAGS = new Set(['culture', 'cultural', 'heritage', 'museum', 'history', 'historical', 'ancient'])

function getTransitionType(title = '', category = '', tags = []) {
  const lowCategory = (category || '').toLowerCase()

  if (lowCategory) {
    if (MUSEUM_CATEGORIES.has(lowCategory)) {
      return 'museum'
    }
    return 'portal'
  }

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
  if (lowTags.some((t) => MUSEUM_STRICT_TAGS.has(t))) return 'museum'

  return 'portal'
}

// ── Museum Door Transition ──────────────────────────────────────────────────
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

        ctx.fillStyle = `rgba(22,18,10,${drawAlpha})`
        ctx.fillRect(0, H * 0.67, W, H * 0.33)

          ;[0.12, 0.23, 0.34, 0.66, 0.77, 0.88].forEach(cx => {
            const cg = ctx.createLinearGradient(W * cx, 0, W * (cx + 0.05), 0)
            cg.addColorStop(0, `rgba(58,44,20,${drawAlpha})`)
            cg.addColorStop(0.5, `rgba(138,112,64,${drawAlpha})`)
            cg.addColorStop(1, `rgba(58,44,20,${drawAlpha})`)
            ctx.fillStyle = cg
            ctx.fillRect(W * cx - W * 0.025, H * 0.26, W * 0.05, H * 0.41)
          })

        ctx.fillStyle = `rgba(80,64,32,${drawAlpha})`
        ctx.fillRect(W * 0.10, H * 0.238, W * 0.80, H * 0.026)
        ctx.fillStyle = `rgba(98,78,40,${drawAlpha})`
        ctx.fillRect(W * 0.08, H * 0.213, W * 0.84, H * 0.025)

        ctx.fillStyle = `rgba(212,184,112,${drawAlpha})`
        ctx.beginPath()
        ctx.ellipse(W * 0.5, H * 0.226, W * 0.042, H * 0.014, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(1,3,10,${drawAlpha})`
        ctx.fillRect(W * 0.425, H * 0.295, W * 0.15, H * 0.385)
        ctx.strokeStyle = `rgba(220,195,140,${0.65 * drawAlpha})`
        ctx.lineWidth = W * 0.005
        ctx.strokeRect(W * 0.425, H * 0.295, W * 0.15, H * 0.385)

        const doorGlow = ctx.createRadialGradient(W * 0.5, H * 0.48, 0, W * 0.5, H * 0.48, W * 0.14)
        doorGlow.addColorStop(0, `rgba(220,180,100,${(0.25 + eased * 0.4) * drawAlpha})`)
        doorGlow.addColorStop(1, 'rgba(220,180,100,0)')
        ctx.fillStyle = doorGlow
        ctx.fillRect(W * 0.3, H * 0.18, W * 0.4, H * 0.64)

        ctx.restore()
      }

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

// ── Individual Event Card ───────────────────────────────────────────────────
function RecommendedEventCard({ event, onView }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showMuseumTransition, setShowMuseumTransition] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const [imgRect, setImgRect] = useState(null)
  const imgRef = useRef(null)
  const navigate = useNavigate()
  const currentLocation = useLocation()

  const doNavigate = (isMuseum = false) => {
    if (onView) onView()
  }

  const handleViewClick = () => setShowConfirm(true)
  const handleCancel = () => setShowConfirm(false)

  const handleConfirm = () => {
    setShowConfirm(false)
    const type = getTransitionType(event.title, event.category || '', event.tags || [])
    if (type === 'museum') {
      setShowMuseumTransition(true)
    } else {
      if (imgRef.current) {
        setImgRect(imgRef.current.getBoundingClientRect())
      }
      setShowReveal(true)
    }
  }

  return (
    <>
      {showMuseumTransition && <MuseumDoorTransition onComplete={() => doNavigate(true)} />}
      {showReveal && (
        <CinematicReveal
          image={event.image || ''}
          title={event.title}
          rect={imgRect}
          onComplete={() => doNavigate(false)}
        />
      )}

      <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full w-full">
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            ref={imgRef}
            src={event.image || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#2F80ED]" /> {event.date || 'Soon'}
          </span>
          <p className="absolute bottom-3 left-3 text-white text-xs font-medium drop-shadow flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {event.location || 'Cairo, Egypt'}
          </p>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{event.title || 'Event Title'}</h3>
          <div className="flex flex-wrap gap-1 mb-3">
            {(event.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-[#f0f7ff] text-[#2F80ED] rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((index) => (
                <img
                  key={index}
                  src={`https://i.pravatar.cc/40?u=event-${event.id}-${index}`}
                  alt={`User ${index + 1}`}
                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' }}
                />
              ))}
            </div>
            {(event.attendeeCount || 8) > 3 && (
              <span className="text-sm text-gray-500">+{Math.max(0, (event.attendeeCount || 8) - 3)} joined</span>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3.5 h-3.5" />
              {event.attendeeCount || 8} attendees
            </span>
            <button
              id={`view-event-rec-${event.id}`}
              onClick={handleViewClick}
              className="text-xs font-semibold text-[#2F80ED] bg-[#f0f7ff] hover:bg-[#2F80ED] hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              View &rarr;
            </button>
          </div>
        </div>

        {showConfirm && (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 999,
              background: 'rgba(2,10,24,0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 16
            }}
            onClick={handleCancel}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0f1a2e',
                border: '1px solid rgba(56,189,248,0.3)',
                borderRadius: 20,
                padding: '24px 20px',
                maxWidth: 260,
                width: '85%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                textAlign: 'center',
                animation: 'fadeup 0.3s ease-out both'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎫</div>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>View event?</h3>
              <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 20, lineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {event.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={handleConfirm}
                  style={{
                    width: '100%', padding: '10px 0',
                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                    border: 'none', borderRadius: 10,
                    color: '#fff', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer'
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
                    fontSize: 12, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Main Export ─────────────────────────────────────────────────────────────
export default function RecommendedEvents({ events = [], onViewEvent, listRef }) {
  if (!events.length) return null
  return (
    <CarouselSlider itemWidth={312} listRef={listRef}>
      {events.map((event, i) => (
        <div key={event.id} data-sr-index={i} className="reveal-card w-72 h-full">
          <RecommendedEventCard event={event} onView={() => onViewEvent?.(event.id)} />
        </div>
      ))}
    </CarouselSlider>
  )
}

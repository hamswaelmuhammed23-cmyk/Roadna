import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ExploreTripCard from '../../components/explore/ExploreTripCard'

const API_BASE = ''
const MAX_TRIPS  = 100
const MAX_EVENTS = 100

function mapItemToTripShape(item) {
  if (!item) return null
  return {
    title:          item.title    || 'Unnamed',
    titleHighlight: item.category || '',
    status:         'Booking Open',
    destination:    item.location || 'Egypt',
    startDate:      item.date     || 'Coming Soon',
    endDate:        item.date     || 'Coming Soon',
    durationDays:   parseInt(item.duration) || 1,
    meetingPoint:   item.location || 'Egypt',
    priceEGP:       parseInt(item.cost) || 0,
    priceUSD:       Math.round((parseInt(item.cost) || 0) / 49),
    rating:         item.rating   || 4.5,
    reviewCount:    0,
    difficulty:     'Moderate',
    seatsTotal:     item.travelers || 20,
    seatsLeft:      Math.floor((item.travelers || 20) * 0.4),
    image:          item.image    || '',
    description:    item.description || '',
    details: { transport: 'TBA', stay: 'TBA', meals: 'TBA', guide: 'English & Arabic speaking' },
    included: [
      { label: 'Entry pass',       yes: true  },
      { label: 'Guide',            yes: true  },
      { label: 'Transport',        yes: false },
      { label: 'Travel insurance', yes: false },
    ],
    bring: ['ID', 'Comfortable shoes', 'Camera', 'Water bottle'],
    organizer: { name: item.organizerName || 'Roadna', contact: 'trips@roadna.com' },
  }
}

export default function ExploreAll() {
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const initialTab  = queryParams.get('tab') === 'events' ? 'events' : 'trips'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [trips,     setTrips]     = useState([])
  const [events,    setEvents]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${API_BASE}/api/v1/ai/items`)
        const data = await res.json()
        if (data.success) {
          const mapped = (data.items || []).map((item, i) => {
            const id = item.ID || item.id || `item-${i}`
            return {
              id,
              title:       item.Name        || 'Unnamed',
              location:    item.From && item.To ? `${item.From} → ${item.To}` : item.From || item.To || 'Egypt',
              description: item.Description || '',
              category:    item.Category    || '',
              tags:        typeof item.Tags === 'string' ? item.Tags.split(',').map(t => t.trim()).filter(Boolean) : [],
              duration:    item.Duration_Days ? `${item.Duration_Days} Days` : '',
              cost:        item.Cost_EGP    ? `${item.Cost_EGP} EGP` : '',
              rating:      item.Rating      || 4.5,
              travelers:   item.Travelers_Count || 10,
              image:       item.Image       || `https://picsum.photos/seed/${id}/800/600`,
              date:        item.Date_Field  || item.Start_Date || item.Event_Date || item.Date || null,
              // split by index: even → trip, odd → event
              type:        i % 2 === 0 ? 'trip' : 'event',
            }
          })

          setTrips(mapped.filter(i => i.type === 'trip').slice(0, MAX_TRIPS))
          setEvents(mapped.filter(i => i.type === 'event').slice(0, MAX_EVENTS))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allItems = [...trips, ...events]

  const handleViewTrip = (id) => {
    const item = allItems.find(i => String(i.id) === String(id))
    navigate(`/trip/${id}`, { state: { trip: mapItemToTripShape(item), mode: 'trip', from: '/explore/all' } })
  }

  const handleViewEvent = (id) => {
    const item = allItems.find(i => String(i.id) === String(id))
    navigate(`/event/${id}`, { state: { trip: mapItemToTripShape(item), mode: 'event', from: '/explore/all?tab=events' } })
  }

  const currentItems = activeTab === 'trips' ? trips : events

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white shadow-sm text-gray-500 hover:text-[#2F80ED] hover:bg-[#eef5ff] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#2F80ED]">Explore More</h1>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading…' : `${trips.length} trips · ${events.length} events`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          {[
            { key: 'trips',  label: `All Trips (${trips.length})`   },
            { key: 'events', label: `All Events (${events.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-3 px-6 font-semibold text-sm transition-colors relative ${
                activeTab === key ? 'text-[#2F80ED]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              {activeTab === key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2F80ED] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#2F80ED] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Grid */}
        {!loading && currentItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.map(item => (
              <div key={item.id} style={{ opacity: 1 }}>
                <ExploreTripCard
                  trip={item}
                  onView={() => activeTab === 'trips' ? handleViewTrip(item.id) : handleViewEvent(item.id)}
                  compact={false}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && currentItems.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg">
              No {activeTab} available right now.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
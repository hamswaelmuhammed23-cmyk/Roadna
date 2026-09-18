import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useScrollReveal, { useScrollRevealList } from '../../hooks/useScrollReveal'
import { SkeletonSection, SkeletonStyles } from '../../components/explore/ExploreSkeletons'

// Explore-specific sub-components
import WelcomeSection from '../../components/explore/WelcomeSection'
import RecommendedTrips from '../../components/explore/RecommendedTrips'
import RecommendedEvents from '../../components/explore/RecommendedEvents'
import PeopleLikeYou from '../../components/explore/PeopleLikeYou'
import FilterSection from '../../components/explore/FilterSection'
import ResultsGrid from '../../components/explore/ResultsGrid'
import ExploreTripCard from '../../components/explore/ExploreTripCard'
import CarouselSlider from '../../components/explore/CarouselSlider'

const API_BASE = '';


/** Default mock user */
const DEFAULT_MOCK_USER = {
  name: 'Sarah Johnson',
  interests: ['Hiking', 'Music', 'Business'],
  photo: null,
}

const MAX_RECOMMENDED_TRIPS = 4
const MAX_RECOMMENDED_EVENTS = 4

const CATEGORIES = [
  'Documentary', 'Medical', 'Entertainment', 'Business',
  'Culture', 'Sport', 'Education', 'Music', 'Comedy',
  'Arts', 'Trade Shows', 'Technology', 'Adventure', 'Dance'
]

// const TAGS = Object.values(CATEGORY_TAGS).flat()

// function normalizeProfile(profile) {
//   return {
//     name: profile?.name || DEFAULT_MOCK_USER.name,
//     interests: Array.isArray(profile?.interests) && profile.interests.length
//       ? profile.interests
//       : DEFAULT_MOCK_USER.interests,
//     photo: profile?.photo || DEFAULT_MOCK_USER.photo,
//   }
// }

// ─────────────────────────────────────────────────────────────────────────────
// ExploreContent — rendered ONLY after loading is done, so all scroll-reveal
// refs are attached to real DOM nodes on first mount.
// ─────────────────────────────────────────────────────────────────────────────
function ExploreContent({
  user,
  recommendedTrips,
  recommendedEvents,
  peopleLikeYou,
  allItems,
  filteredItems,
  isFiltering,
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagsChange,
  onClearFilters,
  onViewTrip,
  onViewEvent,
  onViewProfile,
  onChat,
  navigate,
  categories,        // ← ADD
  categoryTags,      // ← ADD
  aiLoading,         // ← ADD
  aiError,           // ← ADD
  aiPredictedClass,
}) {
  // ── Scroll reveal refs ──────────────────────────────────────
  const filterRef = useScrollReveal()
  const tripsRef = useScrollReveal()
  const tripsListRef = useScrollRevealList({ staggerMs: 90 })
  const eventsRef = useScrollReveal()
  const eventsListRef = useScrollRevealList({ staggerMs: 90 })
  const peopleRef = useScrollReveal()
  const upcomingRef = useScrollReveal()
  const upcomingListRef = useScrollRevealList({ staggerMs: 70 })

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <SkeletonStyles />

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <WelcomeSection user={user} />
      </div>

      {/* Filter Section */}
      <section ref={filterRef} className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterSection
          categories={categories.length > 0 ? categories : CATEGORIES}
          categoryTags={categoryTags}
          selectedCategory={selectedCategory}
          selectedTags={selectedTags}
          onCategoryChange={onCategoryChange}
          onTagsChange={onTagsChange}
          onClearFilters={onClearFilters}
        />
      </section>

      {/* Recommended sections — hidden when actively filtering */}
      <div style={{ display: isFiltering ? 'none' : 'block' }}>
        <div style={{
          visibility: isFiltering ? 'hidden' : 'visible',
          height: isFiltering ? 0 : 'auto',
          overflow: isFiltering ? 'hidden' : 'visible'
        }}>
          <>
            {/* Recommended Trips */}
            <section ref={tripsRef} className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-[#2F80ED] flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2F80ED]">Recommended Trips</h2>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium">Based on your interests</p>
                  </div>
                </div>
                <button onClick={() => navigate('/explore/all')} className="text-sm font-semibold text-[#2F80ED] hover:underline">
                  Explore More &rarr;
                </button>
              </div>
              {recommendedTrips.length > 0 ? (
                <RecommendedTrips trips={recommendedTrips} onViewTrip={onViewTrip} listRef={tripsListRef} />
              ) : (
                <p className="text-gray-500">No trips found matching your interests. Try adding more interests to your profile!</p>
              )}
            </section>

            {/* Recommended Events */}
            <section ref={eventsRef} className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-[#2F80ED] flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2F80ED]">Recommended Events</h2>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium">Based on your interests</p>
                  </div>
                </div>
                <button onClick={() => navigate('/explore/all')} className="text-sm font-semibold text-[#2F80ED] hover:underline">
                  Explore More &rarr;
                </button>
              </div>
              {recommendedEvents.length > 0 ? (
                <RecommendedEvents events={recommendedEvents} onViewEvent={onViewEvent} listRef={eventsListRef} />
              ) : (
                <p className="text-gray-500">No events found matching your interests.</p>
              )}
            </section>

            {/* People Like You */}
            <section ref={peopleRef} className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="mb-6 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-[#2F80ED] flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2F80ED]">People Like You</h2>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium">People who share your complete profile interests</p>
                  </div>
                </div>
              </div>
              <PeopleLikeYou
                users={peopleLikeYou}
                currentUser={user}
                onViewProfile={onViewProfile}
                onChat={onChat}
              />
            </section>

            {/* Upcoming near for you */}
            <section ref={upcomingRef} className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-[#2F80ED] flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2F80ED]">Upcoming near for you</h2>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium">Discover local happenings</p>
                  </div>
                </div>
                <button onClick={() => navigate('/explore/all')} className="text-sm font-semibold text-[#2F80ED] hover:underline">
                  Explore More &rarr;
                </button>
              </div>


              <CarouselSlider itemWidth={312} listRef={upcomingListRef}>
                {allItems.slice(0, 8).map((item, i) => (
                  <div key={`${item.type}-${item.id}`}>

                    <ExploreTripCard
                      trip={{
                        ...item,
                        duration: item.type === 'trip' ? item.duration : item.date,
                        travelers: item.type === 'trip' ? item.travelers : (item.attendeeCount || 8),
                      }}
                      onView={() => item.type === 'trip' ? onViewTrip(item.id) : onViewEvent(item.id)}
                      compact={true}
                    />
                  </div>
                ))}
              </CarouselSlider>
            </section>
          </>
        </div>
      </div>

      {/* Results Section (shown when filtering) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ResultsGrid
          items={isFiltering ? filteredItems : []}
          isFiltering={isFiltering}
          onViewTrip={onViewTrip}
          onViewEvent={onViewEvent}
          onClearFilters={onClearFilters}
          aiLoading={aiLoading}              // ← ADD
          aiError={aiError}                  // ← ADD
          aiPredictedClass={aiPredictedClass}
        />
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Explore page — handles data loading only; renders skeleton → content
// ─────────────────────────────────────────────────────────────────────────────
function mapItemToTripShape(item) {
  if (!item) return null
  return {
    id: item.id || item.ID || item._id,   // ← ADD THIS LINE
    _id: item._id || item.id || item.ID,
    title: item.title || 'Unnamed',
    titleHighlight: item.category || '',
    status: 'Booking Open',
    destination: item.location || 'Egypt',
    startDate: item.date || 'Coming Soon',
    endDate: item.date || 'Coming Soon',
    durationDays: parseInt(item.duration) || 1,
    meetingPoint: item.location || 'Egypt',
    priceEGP: parseInt(item.cost) || 0,
    priceUSD: Math.round((parseInt(item.cost) || 0) / 49),
    rating: item.rating || 4.5,
    reviewCount: 0,
    difficulty: 'Moderate',
    seatsTotal: item.travelers || 20,
    seatsLeft: Math.floor((item.travelers || 20) * 0.4),
    image: item.image || '',
    description: item.description || '',
    details: {
      transport: 'TBA',
      stay: 'TBA',
      meals: 'TBA',
      guide: 'English & Arabic speaking',
    },
    included: [
      { label: 'Entry pass', yes: true },
      { label: 'Guide', yes: true },
      { label: 'Transport', yes: false },
      { label: 'Travel insurance', yes: false },
    ],
    bring: ['ID', 'Comfortable shoes', 'Camera', 'Water bottle'],
    organizer: {
      name: item.organizerName || 'Roadna',
      contact: 'trips@roadna.com',
    },
  }
}
export default function Explore() {
  const navigate = useNavigate()
  const [user, setUser] = useState(DEFAULT_MOCK_USER)
  const [recommendedTrips, setRecommendedTrips] = useState([])
  const [recommendedEvents, setRecommendedEvents] = useState([])
  const [peopleLikeYou, setPeopleLikeYou] = useState([])
  const [allItems, setAllItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoryTags, setCategoryTags] = useState({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiPredictedClass, setAiPredictedClass] = useState(null)

  // Load user profile + personalized data

  useEffect(() => {
    let mounted = true

    const mapItem = (item, index = 0) => {
      const id = item.ID || item.id || `item-${index}`
      let type = 'trip'
      if (item.Classification !== undefined && item.Classification !== null) {
        const lower = typeof item.Classification === 'string'
          ? item.Classification.toLowerCase().trim() : ''
        type = lower === 'event' || lower === 'events' ? 'event' : 'trip'
      }
      return {
        id,
        title: item.Name || 'Unnamed',
        location: item.From && item.To ? `${item.From} → ${item.To}` : item.From || item.To || 'Egypt',
        description: item.Description || '',
        category: item.Category || '',
        tags: typeof item.Tags === 'string' ? item.Tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        duration: item.Duration_Days ? `${item.Duration_Days} Days` : '',
        cost: item.Cost_EGP ? `${item.Cost_EGP} EGP` : '',
        rating: item.Rating || 4.5,
        travelers: item.Travelers_Count || 10,
        image: item.Image || `https://picsum.photos/seed/${id}/800/600`,
        date: item.Date_Field || item.Start_Date || item.Event_Date || item.Date || null,
        type,
      }
    }

    async function loadInitialData() {
      const token = localStorage.getItem('token')

      try {
        // ── FAST: categories + local profile + recommendations ──
        // Load from localStorage immediately while API loads
        const stored = localStorage.getItem('userProfile')
        if (stored && mounted) {
          const p = JSON.parse(stored)
          if (!p.name && p.fullName) p.name = p.fullName
          setUser(p)
        }

        // Categories + first recommendations in parallel (both fast ~60ms)
        const [categoriesResult] = await Promise.allSettled([
          fetch(`${API_BASE}/api/v1/ai/categories`).then(r => r.json()),
        ])

        if (mounted && categoriesResult.status === 'fulfilled' && categoriesResult.value?.success) {
          setCategories(categoriesResult.value.categories || [])
          setCategoryTags(categoriesResult.value.categoryTags || {})
        }

        // Get current user for recommendations
        let currentUser = stored ? JSON.parse(stored) : null
        if (currentUser && !currentUser.name && currentUser.fullName)
          currentUser.name = currentUser.fullName

        // Recommendations based on localStorage interests (fast)
        if (currentUser?.interests?.length > 0) {
          const results = await Promise.allSettled(
            currentUser.interests.map(interest =>
              fetch(`${API_BASE}/api/v1/ai/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: interest, tags: [], top_n: 20 }),
              }).then(r => r.json())
            )
          )

          let trips = [], events = []
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value?.success) {
              const mapped = (result.value.items || []).map(mapItem)
              const asTrips = mapped.filter((_, i) => i % 2 === 0)
              const asEvents = mapped.filter((_, i) => i % 2 !== 0)
              if (trips.length < MAX_RECOMMENDED_TRIPS) trips = [...trips, ...asTrips].slice(0, MAX_RECOMMENDED_TRIPS)
              if (events.length < MAX_RECOMMENDED_EVENTS) events = [...events, ...asEvents].slice(0, MAX_RECOMMENDED_EVENTS)
            }
          })

          if (mounted) {
            setRecommendedTrips(trips)
            setRecommendedEvents(events)
            setAllItems([...trips, ...events])
          }

          if (trips.length === 0 && events.length === 0) await loadFallback()
        
              }    else {
          await loadFallback()
        }
        
        const bgtoken = localStorage.getItem('token')
      } finally {
        // ← Page shows here (~200ms total)
        if (mounted) setLoading(false)
      }

      // ── SLOW: profile + matches load silently in background ──
      if (!localStorage.getItem('token')) return
      const bgtoken = localStorage.getItem('token')

      // These run AFTER page is visible — user doesn't wait for them
      Promise.allSettled([
        fetch(`${API_BASE}/api/v1/profile`, {
          headers: { Authorization: `Bearer ${bgtoken}` }
        }).then(r => r.json()).then(data => {
          if (data.success && mounted) {
            const p = data.data?.user || data.data || data.user
            const currentUser = { ...p, name: p.fullName || p.name, interests: p.interests || [] }
            setUser(currentUser)
            localStorage.setItem('userProfile', JSON.stringify(currentUser))
          }
        }),

        fetch(`${API_BASE}/api/v1/matches/shared?minShared=2`, {
          headers: { Authorization: `Bearer ${bgtoken}` }
        }).then(r => r.json()).then(data => {
          if (data.success && mounted) {
            const mapped = (data.data?.matches || []).map(m => ({
              ...m.user,
              id: m.user._id || m.user.id,
              name: m.user.fullName || m.user.name,
              matchPercent: (m.match.sharedCount || 0) * 25,

            }))
            setPeopleLikeYou(mapped)
          }
        }),
      ]).catch(err => console.error('Background load error:', err))
    }

    loadInitialData()
    return () => { mounted = false }
  }, [])


  // Filter logic
  useEffect(() => {
    if (!selectedCategory && selectedTags.length === 0) {
      setIsFiltering(false)
      setFilteredItems([])
      setAiError(null)
      setAiPredictedClass(null)
      return
    }
    setIsFiltering(true)
    setAiLoading(true)
    setAiError(null)
    setFilteredItems([])

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      console.log('🔍 Filter firing:', selectedCategory, selectedTags)  // ← ADD

      try {
        const res = await fetch(`${API_BASE}/api/v1/ai/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: selectedCategory || '', tags: selectedTags || [], top_n: 50 }),
          signal: controller.signal,
        })
        const data = await res.json()
        if (!data.success) throw new Error()
        console.log('✅ Filter results:', data.items?.length)  // ← ADD

        setAiPredictedClass(data.predicted_class || null)
        setFilteredItems((data.items || []).map((item, i) => {
          const id = item.ID || item.id || `item-${i}`
          return {
            id, title: item.Name || 'Unnamed', location: item.From || item.To || 'Egypt',
            description: item.Description || '', category: item.Category || '',
            tags: typeof item.Tags === 'string' ? item.Tags.split(',').map(t => t.trim()) : [],
            duration: item.Duration_Days ? `${item.Duration_Days} Days` : '',
            rating: item.Rating || 4.5, travelers: item.Travelers_Count || 10,
            image: item.Image || `https://picsum.photos/seed/${id}/800/600`,
            type: (item.Classification?.toString().toLowerCase() === 'event') ? 'event' : 'trip',
          }
        }))
        console.log('📦 filteredItems set, count:', data.items?.length)  // ← ADD

      } catch (err) {
        if (err.name !== 'AbortError') {
          setAiError(err.message)
          setFilteredItems(allItems.slice(0, 20))
        }
      } finally {
        setAiLoading(false)
      }
    }, 300)

    return () => { clearTimeout(timer); controller.abort() }
  }, [selectedCategory, selectedTags])
  const findItem = (id) =>
    [...allItems, ...filteredItems].find(i => String(i.id) === String(id))

  const handleViewTrip = (id) => {
    const trip = findItem(id)
    navigate(`/trip/${id}`, { state: { trip: mapItemToTripShape(trip), mode: 'trip', from: '/explore' } })
  }
  const handleViewEvent = (id) => {
    const item = findItem(id)
    navigate(`/event/${id}`, { state: { trip: mapItemToTripShape(item), mode: 'event', from: '/explore' } })
  }
  const handleViewProfile = (userId) => navigate(`/profile/${userId}`)
  const handleChatUser = (userId) => navigate(`/chat?userId=${userId}`)
  const handleClearFilters = () => {
    setSelectedCategory('')
    setSelectedTags([])
    setIsFiltering(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Skeleton loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <SkeletonStyles />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
          <div style={{
            height: 80, borderRadius: 16, marginBottom: 24,
            background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
            backgroundSize: '400% 100%',
            animation: 'skeletonShimmer 1.4s ease infinite'
          }} />
        </div>
        <SkeletonSection cardCount={4} />
        <SkeletonSection cardCount={4} />
      </div>
    )
  }


  // ── Loaded — mount ExploreContent so all scroll-reveal hooks work ──
  console.log('isFiltering:', isFiltering)
  return (
    <ExploreContent
      user={user}
      recommendedTrips={recommendedTrips}
      recommendedEvents={recommendedEvents}
      peopleLikeYou={peopleLikeYou}
      allItems={allItems}
      filteredItems={filteredItems}
      isFiltering={isFiltering}
      selectedCategory={selectedCategory}
      selectedTags={selectedTags}
      onCategoryChange={setSelectedCategory}
      onTagsChange={setSelectedTags}
      onClearFilters={handleClearFilters}
      onViewTrip={handleViewTrip}
      onViewEvent={handleViewEvent}
      onViewProfile={handleViewProfile}
      onChat={handleChatUser}
      navigate={navigate}
      categories={categories}            // ← ADD
      categoryTags={categoryTags}        // ← ADD
      aiLoading={aiLoading}              // ← ADD
      aiError={aiError}                  // ← ADD
      aiPredictedClass={aiPredictedClass}

    />

  )
}

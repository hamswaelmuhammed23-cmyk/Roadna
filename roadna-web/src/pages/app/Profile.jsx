import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { Map, Calendar, Bookmark, Sparkles, Zap, Users, LogOut, Heart } from 'lucide-react'

const API_BASE = ''

const TABS = [
  { key: 'joined_trips', label: 'Trips', icon: <Map size={16} /> },
  { key: 'joined_events', label: 'Events', icon: <Calendar size={16} /> },
  { key: 'saved_trips', label: 'Saved', icon: <Bookmark size={16} /> },
]

export default function Profile() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isOwnProfile = !id

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('userProfile')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const [activeTab, setActiveTab] = useState('joined_trips')
  const [joinedTrips, setJoinedTrips] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [savedTrips, setSavedTrips] = useState([])
  const [mounted, setMounted] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [toast, setToast] = useState(null)

  // ── Fetch activity from DB → then fetch full items from AI ──
  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('Effect ran. id:', id, 'token:', token)

    // For public profile, no token needed
    // For own profile, token is required
    const activityUrl = id
      ? `${API_BASE}/api/v1/profile/${id}/activity`
      : `${API_BASE}/api/v1/profile/activity`

    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {}

    // Reset lists when switching profiles
    setJoinedTrips([])
    setJoinedEvents([])
    setSavedTrips([])
    console.log('Fetching:', activityUrl, 'headers:', headers)

    fetch(activityUrl, { headers })
      .then(r => r.json())
      .then(async (activityData) => {
        if (!activityData.success) return

        const {
          joinedTripIds = [],
          joinedEventIds = [],
          savedTripIds = [],
        } = activityData.data

        // Debug — remove after confirming data arrives
        console.log('Activity data:', { joinedTripIds, joinedEventIds, savedTripIds })

        const allIds = [...new Set([
          ...joinedTripIds,
          ...joinedEventIds,
          ...savedTripIds,
        ])]

        if (allIds.length === 0) return

        const res = await fetch(`${API_BASE}/api/v1/ai/items-by-ids`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: allIds }),
        })
        const data = await res.json()

        // Debug — remove after confirming items arrive
        console.log('Items by IDs:', data)

        if (!data.success) return

        const allItems = data.items || []

        const tripIdSet = new Set(joinedTripIds.map(String))
        const eventIdSet = new Set(joinedEventIds.map(String))
        const savedIdSet = new Set(savedTripIds.map(String))

        const normalize = (item) => ({
          ...item,
          tripId: String(item.ID || item.id),
          eventId: String(item.ID || item.id),
          title: item.Name || item.title || 'Unnamed',
          img: item.Image || item.img || `https://picsum.photos/seed/${item.ID}/800/600`,
          destination: item.To || item.From || item.destination || 'Egypt',
          startDate: item.Start_Date || item.Date_Field || '',
          date: item.Event_Date || item.Date_Field || '',
        })
        console.log('tripIdSet:', [...tripIdSet])
        console.log('allItems IDs:', allItems.map(i => String(i._id || i.ID || i.id)))

        setJoinedTrips(
          allItems.filter(i => tripIdSet.has(String(i.ID || i.id))).map(normalize)
        )
        setJoinedEvents(
          allItems.filter(i => eventIdSet.has(String(i.ID || i.id))).map(normalize)
        )
        setSavedTrips(
          allItems.filter(i => savedIdSet.has(String(i.ID || i.id))).map(normalize)
        )
      })
      .catch(err => console.error('Activity fetch failed:', err))

  }, [id]) // ← critical: re-run when the profile ID changes
  // ── Fetch profile (own or public) ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (id) {
          const res = await fetch(`${API_BASE}/api/v1/profile/${id}`)
          const data = await res.json()
          if (data.success) {
            const u = data.data.user
            setUser({ ...u, name: u.fullName || u.name })
          }
          return
        }

        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch(`${API_BASE}/api/v1/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success && data.data?.user) {
          const fetchedUser = data.data.user
          fetchedUser.name = fetchedUser.fullName || fetchedUser.name
          setUser(fetchedUser)
          localStorage.setItem('userProfile', JSON.stringify({
            _id: fetchedUser._id,
            name: fetchedUser.name,
            photo: fetchedUser.photo,
            interests: fetchedUser.interests,
            bio: fetchedUser.bio,
          }))
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchProfile()
  }, [id])

  // ── Cancel a journey ──
  const handleCancelItem = async (item, tabKey) => {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        const endpoint = tabKey === 'joined_trips' ? 'leave-trip' :
          tabKey === 'joined_events' ? 'leave-event' : 'unsave-trip'
        const body = tabKey === 'joined_trips'
          ? { tripId: item.tripId || item.ID }
          : tabKey === 'joined_events'
            ? { eventId: item.eventId || item.ID }
            : { tripId: item.tripId || item.ID }

        await fetch(`${API_BASE}/api/v1/profile/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })
      } catch (err) {
        console.error('Leave request failed:', err)
      }
    }

    // Optimistic UI
    const idVal = item.tripId || item.eventId || item.ID
    if (tabKey === 'joined_trips')
      setJoinedTrips(prev => prev.filter(i => (i.tripId || i.ID) !== idVal))
    else if (tabKey === 'joined_events')
      setJoinedEvents(prev => prev.filter(i => (i.eventId || i.ID) !== idVal))
    else
      setSavedTrips(prev => prev.filter(i => (i.tripId || i.ID) !== idVal))

    setConfirmCancel(null)
    setToast({ message: `Successfully cancelled "${item.title}"`, type: 'success' })
    setTimeout(() => setToast(null), 4000)
  }

  if (!user) {
    if (id) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#4CB8E7] to-[#2F80ED] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold tracking-widest uppercase text-sm">Loading Profile...</p>
          </div>
        </div>
      )
    }
    navigate('/login', { replace: true })
    return null
  }

  const interests = user.interests || []
  const isProfileComplete = interests.length >= 4
  const strength = isProfileComplete ? 100 : Math.min(40 + interests.length * 15, 95)
  const listMap = { joined_trips: joinedTrips, joined_events: joinedEvents, saved_trips: savedTrips }
  const activeList = listMap[activeTab] || []

  return (
    <div className="min-h-screen relative overflow-hidden font-['Outfit',sans-serif] bg-gradient-to-br from-[#4CB8E7] to-[#2F80ED]">

      <div id="particles-js-profile" className="absolute inset-0 z-0 pointer-events-none opacity-100" />
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-white/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 py-12 px-4 max-w-4xl mx-auto">
        <div className={`bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.25)] border border-white/70 p-6 md:p-12 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95 rotate-1'}`}>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-100/50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-400 to-cyan-300 shadow-lg group-hover:scale-[1.1] transition-all duration-300">
                  <img
                    src={user.photo || 'https://i.pravatar.cc/300?u=roadna'}
                    alt={user.name}
                    onLoad={() => setMounted(true)}
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-inner"
                  />
                </div>
                {isProfileComplete && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00.723 1.745 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-3xl font-black text-[#1a5fb4] tracking-tight">{user.name}</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium flex items-center justify-center md:justify-start gap-1.5">
                  <Sparkles size={14} className="text-[#2F80ED]" /> {user.bio || 'Travel Explorer | Adventure Seeker'}
                </p>
                <div className="mt-4 max-w-[220px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Strength</span>
                    <span className="text-[10px] font-bold text-[#2F80ED]">{strength}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#4CB8E7] to-[#2F80ED] transition-all duration-1000 ease-out"
                      style={{ width: mounted ? `${strength}%` : '0%' }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 italic">Complete profile for better recommendations</p>
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <button
                onClick={() => navigate(`/chat?userId=${id}`)}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2F80ED] to-[#4CB8E7] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Start Chat
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-3 rounded-2xl bg-gradient-to-br from-[#2F80ED]/8 to-[#4CB8E7]/8 border border-[#2F80ED]/15 hover:-translate-y-1 transition-all duration-300 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#4CB8E7] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <span className="text-2xl font-black text-[#1a5fb4] leading-none">{joinedTrips.length}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">Trips Joined</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-3 rounded-2xl bg-gradient-to-br from-[#9B59B6]/8 to-[#E91E8C]/8 border border-[#9B59B6]/15 hover:-translate-y-1 transition-all duration-300 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9B59B6] to-[#E91E8C] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-2xl font-black text-[#7d3c98] leading-none">{joinedEvents.length}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">Events Joined</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-3 rounded-2xl bg-gradient-to-br from-[#27AE60]/8 to-[#2ECC71]/8 border border-[#27AE60]/15 hover:-translate-y-1 transition-all duration-300 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#27AE60] to-[#2ECC71] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <span className="text-2xl font-black text-[#1e8449] leading-none">{savedTrips.length}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">Saved Trips</span>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2.5 text-slate-600">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2F80ED] to-[#4CB8E7] flex items-center justify-center shadow-sm flex-shrink-0">
                <Heart size={14} className="text-white" />
              </span>
              My Interests
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {interests.length === 0 && (
                <div className="w-full p-6 rounded-2xl border-dashed border-2 border-slate-200 flex flex-col items-center gap-2">
                  <p className="text-slate-500 text-xs font-bold text-center">Your profile is a blank canvas ✨</p>
                  <p className="text-slate-400 text-[10px] text-center max-w-[200px]">Add interests to find your perfect travel tribe.</p>
                  <button onClick={() => navigate('/complete-profile')} className="mt-2 text-[#2F80ED] text-[11px] font-black uppercase tracking-wider hover:underline">Add Interests →</button>
                </div>
              )}
              {interests.map((interest) => (
                <div key={interest} className="px-5 py-2 bg-gradient-to-br from-[#2F80ED]/10 to-[#4CB8E7]/10 text-[#1a5fb4] text-xs font-semibold rounded-full border border-[#2F80ED]/25 cursor-default select-none transition-all duration-300 hover:from-[#2F80ED] hover:to-[#4CB8E7] hover:text-white hover:border-transparent hover:scale-110">
                  {interest}
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}

          {/* Activity — show for everyone, cancel only for own profile */}
          <div className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2.5 text-slate-600">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#F7971E] to-[#FFD200] flex items-center justify-center shadow-sm flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </span>
              {isOwnProfile ? 'Your Journeys' : `${user.name?.split(' ')[0]}'s Journeys`}
            </h2>

            <div className="flex gap-1 bg-slate-50/80 rounded-xl p-1 mb-6 w-fit border border-slate-100">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeTab === tab.key ? 'bg-white text-[#2F80ED] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeList.length === 0 ? (
              <div className="text-center py-16 rounded-[32px] border-2 border-dashed border-slate-200/60">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-100/50 rounded-full flex items-center justify-center text-slate-400">
                  <Map size={40} />
                </div>
                <h3 className="text-lg font-black text-slate-700 mb-2">Nothing here yet 🌍</h3>
                <p className="text-slate-400 text-xs max-w-[240px] mx-auto leading-relaxed">
                  {isOwnProfile
                    ? `You haven't joined any ${activeTab.replace(/_/g, ' ')} yet.`
                    : `${user.name?.split(' ')[0]} hasn't joined any ${activeTab.replace(/_/g, ' ')} yet.`}
                </p>
                {isOwnProfile && (
                  <button onClick={() => navigate('/explore')} className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#2F80ED] to-[#4CB8E7] text-white text-[11px] font-black uppercase tracking-widest rounded-xl">
                    Discover Trips
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeList.map((item, idx) => (
                  <div
                    key={item.tripId || item.eventId || idx}
                    className="group bg-white rounded-[32px] border border-slate-100 overflow-hidden flex flex-col opacity-0 translate-y-4 relative"
                    style={{ animation: mounted ? `fadeInUp 0.6s ease forwards ${idx * 120}ms` : 'none' }}
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img src={item.img || '/images/pyramids.webp'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#2F80ED] text-[10px] font-black uppercase rounded-full shadow-xl flex items-center gap-1.5">
                          <Zap size={10} fill="currentColor" /> Joined
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-[#2F80ED] transition-colors">{item.title}</h3>
                      <p className="text-slate-400 text-xs font-bold mb-6 flex items-center gap-1">📍 {item.destination || 'Egypt'}</p>

                      {/* Cancel button only on own profile */}
                      {isOwnProfile && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmCancel({ item, tabKey: activeTab }) }}
                          className="mt-auto w-full py-3 bg-gradient-to-r from-[#4CB8E7] to-[#2F80ED] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Zap size={12} strokeWidth={3} /> Cancel Journey
                        </button>
                      )}
                    </div>

                    {/* Confirm cancel overlay — own profile only */}
                    {isOwnProfile && confirmCancel && confirmCancel.item.title === item.title && (
                      <div className="absolute inset-0 z-50 bg-[#2F80ED]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                        <h4 className="text-white text-lg font-black mb-2">Cancel Journey?</h4>
                        <p className="text-white/80 text-[10px] leading-relaxed mb-6 font-medium">
                          Are you sure you want to leave this journey?
                        </p>
                        <div className="w-full flex flex-col gap-2">
                          <button onClick={() => handleCancelItem(item, activeTab)} className="w-full py-2.5 bg-white text-[#2F80ED] text-[10px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all">
                            Confirm Cancel
                          </button>
                          <button onClick={() => setConfirmCancel(null)} className="w-full py-2.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all">
                            Go Back
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connections */}
          {isOwnProfile && (
            <div className="pb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2.5 text-slate-600">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#27AE60] to-[#2ECC71] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Users size={14} className="text-white" />
                </span>
                My Connections
              </h2>
              <div className="flex flex-col items-center justify-center py-12 rounded-[32px] border-2 border-dashed border-slate-200/60 gap-4">
                <div className="text-center px-6">
                  <h3 className="text-sm font-black text-slate-700 mb-1 uppercase tracking-widest">Build Your Network 🤝</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed max-w-[300px]">
                    Travel is better together. Join a trip and your connections will appear here.
                  </p>
                </div>
                <button onClick={() => navigate('/explore')} className="px-6 py-2.5 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white text-[11px] font-black uppercase tracking-widest rounded-xl">
                  Find Connections
                </button>
              </div>
            </div>
          )}

          {isOwnProfile && (
            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-center">
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('authToken')
                  localStorage.removeItem('userProfile')
                  localStorage.removeItem('otpVerified')
                  localStorage.removeItem('joinedTrips')
                  localStorage.removeItem('joinedEvents')
                  localStorage.removeItem('savedTrips')
                  navigate('/')
                }}
                className="flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-[#2F80ED] to-[#4CB8E7] text-white text-[12px] font-black uppercase tracking-[5px] rounded-2xl shadow-xl active:scale-95 transition-all"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 z-[110]" style={{ animation: 'toastIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards' }}>
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex items-center gap-4 min-w-[320px]">
            <div className="w-12 h-12 rounded-2xl bg-[#2F80ED] flex items-center justify-center">
              <Zap size={24} className="text-white" fill="currentColor" />
            </div>
            <div>
              <p className="text-white text-sm font-black mb-0.5">Updated! 🌊</p>
              <p className="text-slate-400 text-[11px] font-medium leading-tight max-w-[180px]">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateX(50px) scale(0.9); }
          70%  { transform: translateX(-5px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        #particles-js-profile canvas { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
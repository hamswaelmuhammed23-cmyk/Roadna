/**
 * AdminDashboard.jsx
 * Converted from dashboard.ejs → React JSX.
 * Token is read from localStorage('authToken').
 * API: GET /api/v1/admin/dashboard
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STAT_CARDS = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    gradient: 'from-blue-500 to-blue-600',
    icon: (
      <svg className="w-10 h-10 opacity-80" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    key: 'totalTrips',
    label: 'Total Trips',
    gradient: 'from-green-500 to-green-600',
    icon: (
      <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
  },
  {
    key: 'totalEvents',
    label: 'Total Events',
    gradient: 'from-purple-500 to-purple-600',
    icon: (
      <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    key: 'activeUsers',
    label: 'Active Users',
    gradient: 'from-amber-500 to-amber-600',
    icon: (
      <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
]

const EXTRA_STATS = [
  { key: 'totalTripParticipants', label: 'Trip Participants' },
  { key: 'totalEventParticipants', label: 'Event Participants' },
  { key: 'openTrips', label: 'Open Trips' },
  { key: 'activeEvents', label: 'Active Events' },
]

const QUICK_ACTIONS = [
  { to: '/admin/users', label: 'Manage Users', sub: 'View, edit, delete users',
    icon: <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { to: '/admin/trips', label: 'Manage Trips', sub: 'View, edit, delete trips',
    icon: <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> },
  { to: '/admin/events', label: 'Manage Events', sub: 'View, edit, delete events',
    icon: <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken')
        if (!token) {
          setError('Authentication required. Please login first.')
          setLoading(false)
          return
        }
        const res = await fetch('/api/v1/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load statistics')
        const data = await res.json()
        if (data.success) setStats(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-7 h-7 text-[#f7971e]" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
          </svg>
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage users, trips, events, and platform statistics</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card) => (
          <div key={card.key}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-extrabold">
                  {loading ? '—' : stats?.[card.key] ?? '—'}
                </p>
                <p className="text-sm mt-1 opacity-90">{card.label}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.to}
            onClick={() => navigate(action.to)}
            className="bg-white border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex justify-center mb-3">{action.icon}</div>
            <h3 className="font-bold text-gray-800 text-sm">{action.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{action.sub}</p>
          </button>
        ))}
      </div>

      {/* Extra Stats */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">More Statistics</h2>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {EXTRA_STATS.map((s) => (
          <div key={s.key} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '—' : stats?.[s.key] ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

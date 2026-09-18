/**
 * AdminTrips.jsx
 * Converted from trips.ejs → React JSX.
 * Token: localStorage('authToken')
 * API: GET/PUT/DELETE /api/v1/admin/trips
 */
import { useState, useEffect, useCallback } from 'react'

const STATUS_STYLES = {
  open:      { bg: 'bg-green-100',  text: 'text-green-700' },
  full:      { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cancelled: { bg: 'bg-red-100',    text: 'text-red-700' },
  completed: { bg: 'bg-gray-100',   text: 'text-gray-600' },
}

function StatusBadge({ status = 'open' }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.open
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text} capitalize`}>
      {status}
    </span>
  )
}

function Pagination({ page, pages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
        ← Previous
      </button>
      <span className="text-sm text-gray-500">Page {page} of {pages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= pages}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
        Next →
      </button>
    </div>
  )
}

function EditTripModal({ trip, onClose, onSave }) {
  const [form, setForm] = useState({
    title: trip.title || '',
    destination: trip.destination || '',
    status: trip.status || 'open',
    description: trip.description || '',
  })
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(trip.id, form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Edit Trip</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { id: 'title', label: 'Trip Title', type: 'text', required: true },
            { id: 'destination', label: 'Destination', type: 'text' },
          ].map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} name={f.id} value={form[f.id]} onChange={handleChange}
                required={f.required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition"/>
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition">
              {['open', 'full', 'cancelled', 'completed'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition resize-none"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#f7971e] to-[#ffd200] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminTrips() {
  const [trips, setTrips] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const token = localStorage.getItem('token') || localStorage.getItem('authToken')

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadTrips = useCallback(async (page = 1, q = search, st = statusFilter) => {
    try {
      setLoading(true)
      let url = `/api/v1/admin/trips?page=${page}&limit=20` 
      if (q)  url += `&search=${encodeURIComponent(q)}` 
      if (st) url += `&status=${encodeURIComponent(st)}` 
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.success) {
        setTrips(data.data.trips)
        setPagination(data.data.pagination)
      }
    } catch {
      showToast('Failed to load trips', 'error')
    } finally {
      setLoading(false)
    }
  }, [token, search, statusFilter])

  useEffect(() => { loadTrips() }, [loadTrips])

  useEffect(() => {
    const t = setTimeout(() => loadTrips(1, search, statusFilter), 400)
    return () => clearTimeout(t)
  }, [search, statusFilter, loadTrips])

  async function handleSave(tripId, form) {
    try {
      const res = await fetch(`/api/v1/admin/trips/${tripId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showToast('Trip updated successfully!')
      setEditTarget(null)
      loadTrips(pagination.page)
    } catch (err) {
      showToast(err.message || 'Failed to update trip', 'error')
    }
  }

  async function handleDelete(tripId, title) {
    if (!window.confirm(`Delete trip "${title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/v1/admin/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showToast('Trip deleted!')
      loadTrips(pagination.page)
    } catch (err) {
      showToast(err.message || 'Failed to delete trip', 'error')
    }
  }

  async function openEdit(tripId) {
    try {
      const res = await fetch(`/api/v1/admin/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setEditTarget(data.data)
    } catch {
      showToast('Failed to load trip details', 'error')
    }
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Trips</h1>
        <p className="text-gray-500 text-sm mt-1">View, edit, and delete all trips</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search trips by title, destination…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition"
        >
          <option value="">All Status</option>
          {['open', 'full', 'cancelled', 'completed'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Loading trips…
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            <p className="text-sm">No trips found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7971e]/10 text-gray-600 text-xs uppercase tracking-wider">
                    {['ID', 'Title', 'Destination', 'Host', 'Status', 'Start Date', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{trip.id}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{trip.title}</td>
                      <td className="px-5 py-3 text-gray-600">{trip.destination || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{trip.host_username || trip.host_name || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={trip.status} /></td>
                      <td className="px-5 py-3 text-gray-500">
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(trip.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(trip.id, trip.title)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-50">
              <Pagination page={pagination.page} pages={pagination.pages}
                onPageChange={(p) => loadTrips(p)} />
            </div>
          </>
        )}
      </div>

      {editTarget && (
        <EditTripModal trip={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />
      )}
    </div>
  )
}

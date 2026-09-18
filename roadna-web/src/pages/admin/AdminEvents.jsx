/**
 * AdminEvents.jsx
 * Converted from events.ejs → React JSX.
 * Token: localStorage('authToken')
 * API: GET/PUT/DELETE /api/v1/admin/events
 */
import { useState, useEffect, useCallback } from 'react'

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {active ? 'Active' : 'Inactive'}
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

function EditEventModal({ event, onClose, onSave }) {
  const [form, setForm] = useState({
    title: event.title || '',
    location: event.location || '',
    description: event.description || '',
    is_active: !!event.is_active,
  })
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(event.id, form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Edit Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { id: 'title',    label: 'Event Title', type: 'text', required: true },
            { id: 'location', label: 'Location',    type: 'text' },
          ].map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} name={f.id} value={form[f.id]} onChange={handleChange}
                required={f.required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition"/>
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition resize-none"/>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}
              className="w-4 h-4 rounded accent-[#f7971e]"/>
            <span className="text-sm font-semibold text-gray-700">Active</span>
          </label>

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

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const token = localStorage.getItem('token') || localStorage.getItem('authToken')

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadEvents = useCallback(async (page = 1, q = search) => {
    try {
      setLoading(true)
      const url = `/api/v1/admin/events?page=${page}&limit=20${q ? `&search=${encodeURIComponent(q)}` : ''}` 
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.success) {
        setEvents(data.data.events)
        setPagination(data.data.pagination)
      }
    } catch {
      showToast('Failed to load events', 'error')
    } finally {
      setLoading(false)
    }
  }, [token, search])

  useEffect(() => { loadEvents() }, [loadEvents])

  useEffect(() => {
    const t = setTimeout(() => loadEvents(1, search), 400)
    return () => clearTimeout(t)
  }, [search, loadEvents])

  async function handleSave(eventId, form) {
    try {
      const res = await fetch(`/api/v1/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showToast('Event updated successfully!')
      setEditTarget(null)
      loadEvents(pagination.page)
    } catch (err) {
      showToast(err.message || 'Failed to update event', 'error')
    }
  }

  async function handleDelete(eventId, title) {
    if (!window.confirm(`Delete event "${title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/v1/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showToast('Event deleted!')
      loadEvents(pagination.page)
    } catch (err) {
      showToast(err.message || 'Failed to delete event', 'error')
    }
  }

  async function openEdit(eventId) {
    try {
      const res = await fetch(`/api/v1/admin/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setEditTarget(data.data)
    } catch {
      showToast('Failed to load event details', 'error')
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
        <h1 className="text-2xl font-bold text-gray-800">Manage Events</h1>
        <p className="text-gray-500 text-sm mt-1">View, edit, and delete all events</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <input
          type="text"
          placeholder="Search events by title, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Loading events…
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-sm">No events found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7971e]/10 text-gray-600 text-xs uppercase tracking-wider">
                    {['ID', 'Title', 'Location', 'Organizer', 'Date', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{event.id}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{event.title}</td>
                      <td className="px-5 py-3 text-gray-600">{event.location || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{event.creator_username || event.organizer || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {event.event_date ? new Date(event.event_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3"><StatusBadge active={event.is_active} /></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(event.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(event.id, event.title)}
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
                onPageChange={(p) => loadEvents(p)} />
            </div>
          </>
        )}
      </div>

      {editTarget && (
        <EditEventModal event={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />
      )}
    </div>
  )
}

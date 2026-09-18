/**
 * AdminUsers.jsx
 * Converted from users.ejs → React JSX.
 * Token: localStorage('authToken')
 * API: GET/PUT/DELETE /api/v1/admin/users
 */
import { useState, useEffect, useCallback } from 'react'

// ── Reusable sub-components ───────────────────────────────────────────────────

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function Pagination({ page, pages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ← Previous
      </button>
      <span className="text-sm text-gray-500">Page {page} of {pages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Next →
      </button>
    </div>
  )
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    email: user.email || '',
    username: user.username || '',
    full_name: user.full_name || '',
    location: user.location || '',
    is_active: !!user.is_active,
    is_admin: !!user.is_admin,
  })
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(user.id, form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { id: 'email', label: 'Email', type: 'email', required: true },
            { id: 'username', label: 'Username', type: 'text', required: true },
            { id: 'full_name', label: 'Full Name', type: 'text', required: true },
            { id: 'location', label: 'Location', type: 'text' },
          ].map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.id}
                value={form[field.id]}
                onChange={handleChange}
                required={field.required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition"
              />
            </div>
          ))}

          <div className="flex gap-6">
            {[
              { id: 'is_active', label: 'Active' },
              { id: 'is_admin', label: 'Admin' },
            ].map((chk) => (
              <label key={chk.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={chk.id}
                  checked={form[chk.id]}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-[#f7971e]"
                />
                <span className="text-sm font-semibold text-gray-700">{chk.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#f7971e] to-[#ffd200] text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers] = useState([])
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

  const loadUsers = useCallback(async (page = 1, q = search) => {
    try {
      setLoading(true)
      const url = `/api/v1/admin/users?page=${page}&limit=20${q ? `&search=${encodeURIComponent(q)}` : ''}` 
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
        setPagination(data.data.pagination)
      }
    } catch {
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [token, search])

  useEffect(() => { loadUsers() }, [loadUsers])

  useEffect(() => {
    const t = setTimeout(() => loadUsers(1, search), 400)
    return () => clearTimeout(t)
  }, [search, loadUsers])

  async function handleSave(userId, form) {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showToast('User updated successfully!')
      setEditTarget(null)
      loadUsers(pagination.page)
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error')
    }
  }

  async function handleDelete(userId, email) {
    if (!window.confirm(`Delete user "${email}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showToast('User deleted!')
      loadUsers(pagination.page)
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error')
    }
  }

  async function openEdit(userId) {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setEditTarget(data.data)
    } catch {
      showToast('Failed to load user details', 'error')
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">View, edit, and manage all users</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <input
          type="text"
          placeholder="Search users by email, username, or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7971e]/40 focus:border-[#f7971e] transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7971e]/10 text-gray-600 text-xs uppercase tracking-wider">
                    {['ID', 'Email', 'Username', 'Full Name', 'Status', 'Admin', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{user.id}</td>
                      <td className="px-5 py-3 text-gray-700">{user.email}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{user.username}</td>
                      <td className="px-5 py-3 text-gray-600">{user.full_name || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge active={user.is_active} /></td>
                      <td className="px-5 py-3">
                        {user.is_admin
                          ? <span className="text-[#f7971e] font-bold">✓</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(user.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                          >
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
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={(p) => loadUsers(p)}
              />
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

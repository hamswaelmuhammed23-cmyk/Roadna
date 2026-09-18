import { Outlet } from 'react-router-dom'

/**
 * AuthLayout.jsx
 * Wraps all public / auth pages (login, register, otp, etc.).
 * No persistent navigation bar here — clean, focused auth screens.
 *
 * Future: add a progress-step indicator or brand header here.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  )
}

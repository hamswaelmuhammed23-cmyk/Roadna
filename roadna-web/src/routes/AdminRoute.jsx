import { Navigate, Outlet } from 'react-router-dom'

/**
 * AdminRoute.jsx
 *
 * Protects admin routes. Checks if the logged-in user has the 'admin' role.
 * If not, redirects them to /explore (or /login if not logged in at all).
 */
export default function AdminRoute() {
  try {
    const storedUser = localStorage.getItem('userProfile')
    if (!storedUser) {
      // Not logged in at all
      return <Navigate to="/login" replace />
    }

    const user = JSON.parse(storedUser)

    if (user.role === 'admin') {
      // User is admin, allow access to nested routes
      return <Outlet />
    } else {
      // User is logged in but NOT an admin
      return <Navigate to="/explore" replace />
    }
  } catch (err) {
    // If parsing fails or something goes wrong, safe fallback to login
    return <Navigate to="/login" replace />
  }
}

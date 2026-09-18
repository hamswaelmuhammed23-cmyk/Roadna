//AppRoutes.jsx
import { Routes, Route } from 'react-router-dom'

// Layouts
import AuthLayout from '../layout/AuthLayout'
import AppLayout from '../layout/AppLayout'
import AdminLayout from '../layout/AdminLayout'
import AdminRoute from './AdminRoute'

// Auth pages
import Home from '../pages/auth/Home'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import CompleteProfile from '../pages/auth/CompleteProfile'
import OTP from '../pages/auth/OTP'
import IdentityVerification from '../pages/auth/IdentityVerification'
import HowItWorks from '../pages/auth/HowItWorks'
import Contact from '../pages/auth/Contact'
import About from '../pages/auth/About'

// App pages
import Explore from '../pages/app/Explore'
import ExploreAll from '../pages/app/ExploreAll'
import Chat from '../pages/app/Chat'
import Profile from '../pages/app/Profile'
import Discover from '../pages/app/Discover'
import TripDetails from '../pages/app/TripDetails'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminTrips from '../pages/admin/AdminTrips'
import AdminEvents from '../pages/admin/AdminEvents'

/**
 * AppRoutes.jsx
 * Centralised route table.
 *
 * AUTH  group → wrapped in <AuthLayout>   (no persistent nav)
 * APP   group → wrapped in <AppLayout>    (persistent Navbar)
 * ADMIN group → wrapped in <AdminLayout>  (sidebar + topbar)
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Auth / public routes ─────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/identity" element={<IdentityVerification />} />
      </Route>
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />

      {/* ── Protected / app routes ───────────────────────── */}
      <Route element={<AppLayout />}>
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/all" element={<ExploreAll />} />
        <Route path="/profile" element={<Profile />} />

        {/* <Route path="/profile/:id" element={<PublicProfile />} /> */}

        <Route path="/discover" element={<Discover />} />
      </Route>
      {/* ── Fullscreen App route ─────────────────────────── */}
      <Route path="/chat" element={<Chat />} />
      <Route path="/profile/:id" element={<Profile />} />   {/* ← ADD — public, no auth */}
      <Route path="/trip-details" element={<TripDetails />} />
      <Route path="/trip/:id" element={<TripDetails />} />
      <Route path="/event/:id" element={<TripDetails />} />
      {/* ── Admin routes ─────────────────────────────────── */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="trips" element={<AdminTrips />} />
          <Route path="events" element={<AdminEvents />} />
        </Route>
      </Route>
    </Routes>
  )
}

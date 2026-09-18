import { useNavigate, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { User, LogOut, Settings } from 'lucide-react'
import Logo from './Logo'

/**
 * Navbar.jsx — Unified top navbar matching the Home page Header style.
 * Used in AppLayout (Explore, Chat, Profile pages).
 */
export default function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userProfile')
      if (stored) setUser(JSON.parse(stored))
    } catch (err) {}
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const linkBase = `
    text-sm font-medium transition-all duration-200 cursor-pointer
    px-3 py-1.5 rounded-lg hover:text-[#2F80ED] hover:bg-blue-50
  `
  const activeLink = `${linkBase} text-[#2F80ED] bg-blue-50`
  const inactiveLink = `${linkBase} text-gray-700`

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: scrolled ? '0 2px 24px rgba(47,128,237,0.10)' : '0 1px 0 rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Logo theme="light" size="md" />
        </button>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/explore', label: 'Explore' },
            { to: '/chat', label: 'Messages' },
            { to: '/about', label: 'About Us' },
            { to: '/contact', label: 'Contact Us' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? activeLink : inactiveLink}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!user ? (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none', border: '1.5px solid #2F80ED',
                  color: '#2F80ED', borderRadius: 10,
                  padding: '7px 18px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = '#2F80ED'; e.target.style.color = '#fff' }}
                onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#2F80ED' }}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'linear-gradient(135deg, #4CB8E7, #2F80ED)',
                  border: 'none', color: '#fff', borderRadius: 10,
                  padding: '7px 18px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(47,128,237,0.3)',
                }}
              >
                Register
              </button>
            </>
          ) : (
            /* Profile avatar + dropdown */
            <div className="profile-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#2F80ED', border: '2.5px solid rgba(47,128,237,0.3)',
                  overflow: 'hidden', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(47,128,237,0.25)',
                }}
              >
                {user.photo ? (
                  <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 16, color: '#fff' }}>👤</span>
                )}
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                  background: '#fff', borderRadius: 16,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: '8px 0', minWidth: 200, zIndex: 9999,
                }}>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '12px 16px', background: 'none',
                      border: 'none', cursor: 'pointer',
                      fontSize: 14, color: '#374151',
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontWeight: 500,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <User size={18} className="text-[#2F80ED]" /> My Profile
                  </button>
                  <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
                  {user && user.role === 'admin' && (
                    <>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/admin') }}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '12px 16px', background: 'none',
                          border: 'none', cursor: 'pointer',
                          fontSize: 14, color: '#374151',
                          display: 'flex', alignItems: 'center', gap: 10,
                          fontWeight: 500,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Settings size={18} className="text-[#2F80ED]" /> Admin Panel
                      </button>
                      <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
                    </>
                  )}
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      localStorage.removeItem('token')
                      localStorage.removeItem('authToken')
                      localStorage.removeItem('userProfile')
                      localStorage.removeItem('otpVerified')
                      localStorage.removeItem('joinedTrips')
                      localStorage.removeItem('joinedEvents')
                      localStorage.removeItem('savedTrips')
                      sessionStorage.clear()
                      navigate('/')
                    }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '12px 16px', background: 'none',
                      border: 'none', cursor: 'pointer',
                      fontSize: 14, color: '#ef4444',
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontWeight: 500,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

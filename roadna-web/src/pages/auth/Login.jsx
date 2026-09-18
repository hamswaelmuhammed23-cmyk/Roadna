import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

/**
 * Login.jsx
 *
 * Collects email + password and signs the user in.
 * On success: saves user profile to localStorage and navigates to /explore.
 *
 * Design: glassmorphism card, animated ✈️ plane + smoke trail, particles.js background,
 *         gradient background, golden pulsing submit button.
 *
 * TODO: Replace mock login with real API call (POST /api/auth/login).
 */

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: 'none',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.6)',
  color: '#1d3746',
  fontSize: '14px',
  fontFamily: 'Poppins, sans-serif',
  transition: 'background 0.3s ease, box-shadow 0.3s ease',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  marginBottom: '5px',
  color: '#2b3a55',
}

export default function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const planeRef = useRef(null)
  const containerRef = useRef(null)

  // ── Load particles.js from CDN ────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('particles-script-login')) return
    const script = document.createElement('script')
    script.id = 'particles-script-login'
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
    script.async = true
    script.onload = () => {
      window.particlesJS?.('particles-js-login', {
        particles: {
          number: { value: 100 },
          size: { value: 4 },
          color: { value: '#ffffff' },
          opacity: { value: 0.8 },
          move: { speed: 2.5 },
          line_linked: { enable: true, color: '#ffffff', opacity: 0.5 },
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
          },
        },
        retina_detect: true,
      })
    }
    document.body.appendChild(script)
    return () => {
      try { window.pJSDom?.[0]?.pJS?.fn?.vendors?.destroypJS?.() } catch { /* ignore */ }
    }
  }, [])

  // ── Smoke trail following the animated plane ──────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const plane = planeRef.current
      const container = containerRef.current
      if (!plane || !container) return

      const pr = plane.getBoundingClientRect()
      const cr = container.getBoundingClientRect()

      const smoke = document.createElement('div')
      smoke.style.cssText = `
        position:absolute;
        width:16px; height:16px;
        border-radius:50%;
        background:radial-gradient(circle,rgba(255,255,255,1),rgba(173,216,230,0.3));
        pointer-events:none; z-index:3; filter:blur(1px);
        left:${pr.left - cr.left + 10}px;
        top:${pr.top - cr.top + 10}px;
        animation:smokeLogin 2s ease-out forwards;
      `
      container.appendChild(smoke)
      setTimeout(() => smoke.remove(), 2000)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      // ── 1. Hardcoded admin shortcut (no API call) ──────────────────────
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed')
      }

      const userProfile = {
        ...data.data.user,
        name: data.data.user.fullName || data.data.user.name || 'User'
      }

      localStorage.setItem('userProfile', JSON.stringify(userProfile))
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('authToken', data.data.token)

      // Navigate based on role
      if (userProfile.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/explore', { replace: true })
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Page-scoped CSS ───────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        .login-page { font-family: 'Poppins', sans-serif; }

        @keyframes flyPlaneLogin {
          0%   { top:-25px; left:-25px;                          transform:rotate(45deg);  }
          25%  { top:-25px; left:calc(100% - 10px);             transform:rotate(135deg); }
          50%  { top:calc(100% - 20px); left:calc(100% - 10px); transform:rotate(225deg); }
          75%  { top:calc(100% - 20px); left:-25px;             transform:rotate(315deg); }
          100% { top:-25px; left:-25px;                          transform:rotate(405deg); }
        }
        @keyframes smokeLogin {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(3); }
        }
        @keyframes pulseBtnLogin {
          0%,100% { box-shadow:0 0 0 rgba(255,200,100,0.4); }
          50%     { box-shadow:0 0 20px rgba(255,200,100,0.7); }
        }

        .login-submit-btn {
          animation: pulseBtnLogin 2.5s infinite;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .login-submit-btn:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 0 18px rgba(255,200,100,0.7) !important;
        }
        .login-field:focus {
          background: rgba(255,255,255,0.92) !important;
          box-shadow: 0 0 8px rgba(255,200,150,0.8) !important;
        }
        .login-switch-link {
          color: #e6c225;
          text-decoration: none;
          font-weight: bold;
        }
        .login-switch-link:hover { text-decoration: underline; }
      `}</style>

      {/* ── Page wrapper ──────────────────────────────────────────────────── */}
      <div
        className="login-page"
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #4CB8E7 0%, #2F80ED 100%)',
        }}
      >
        {/* Particles background */}
        <div
          id="particles-js-login"
          style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        />

        {/* ── Glassmorphism card ─────────────────────────────────────────── */}
        <div
          ref={containerRef}
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderRadius: '25px',
            padding: '40px',
            width: '360px',
            maxWidth: '90vw',
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Animated plane ✈️ */}
          <div
            ref={planeRef}
            style={{
              fontSize: '36px',
              position: 'absolute',
              top: '-25px',
              left: '-25px',
              animation: 'flyPlaneLogin 12s linear infinite',
              zIndex: 4,
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
            }}
          >
            ✈️
          </div>

          {/* Heading */}
          <h2 style={{
            marginBottom: '10px',
            fontSize: '26px',
            color: '#2b3a55',
            letterSpacing: '1px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
          }}>
            Welcome Back to Roadna
          </h2>
          <p style={{
            marginBottom: '22px',
            fontSize: '14px',
            color: '#3f3f3f',
            opacity: 0.9,
            fontFamily: 'Poppins, sans-serif',
          }}>
            Find companions for your next adventure
          </p>

          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: '14px',
              padding: '10px 14px',
              background: 'rgba(255,80,80,0.22)',
              border: '1px solid rgba(255,80,80,0.4)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '13px',
              textAlign: 'left',
              fontFamily: 'Poppins, sans-serif',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label htmlFor="login-email" style={labelStyle}>Email</label>
              <input
                id="login-email"
                className="login-field"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label htmlFor="login-password" style={labelStyle}>Password</label>
              <input
                id="login-password"
                className="login-field"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={inputStyle}
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                border: 'none',
                borderRadius: '10px',
                background: 'linear-gradient(135deg,#f7971e,#ffd200)',
                color: '#333',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          {/* Switch to register */}
          <div style={{
            marginTop: '16px',
            fontSize: '14px',
            color: '#555',
            fontFamily: 'Poppins, sans-serif',
          }}>
            Don't have an account?{' '}
            <Link to="/register" className="login-switch-link">
              Register
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

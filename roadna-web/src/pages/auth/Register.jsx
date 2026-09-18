import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

/**
 * Register.jsx
 *
 * Collects name, email, password, and confirmation.
 * On success: saves basic info (name, email, password) to sessionStorage
 *             and navigates to /complete-profile.
 *
 * Design: glassmorphism card, animated ✈️ plane + smoke trail,
 *         particles.js background, gradient background,
 *         golden pulsing submit button, password-strength side panel.
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

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  // ── Password strength checks ──────────────────────────────────────────────
  const pwChecks = {
    length:    form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number:    /[0-9]/.test(form.password),
    symbol:    /[^A-Za-z0-9]/.test(form.password),
  }
  const pwScore  = Object.values(pwChecks).filter(Boolean).length
  const isWeak   = form.password.length > 0 && pwScore < 4
  const showPanel = (pwFocused || isWeak) && form.password.length > 0

  const planeRef     = useRef(null)
  const containerRef = useRef(null)

  // ── Load particles.js from CDN ────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('particles-script-register')) return
    const script = document.createElement('script')
    script.id    = 'particles-script-register'
    script.src   = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
    script.async = true
    script.onload = () => {
      window.particlesJS?.('particles-js-register', {
        particles: {
          number:      { value: 100 },
          size:        { value: 4 },
          color:       { value: '#ffffff' },
          opacity:     { value: 0.8 },
          move:        { speed: 2.5 },
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
      const plane     = planeRef.current
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
        top:${pr.top  - cr.top  + 10}px;
        animation:smokeRegister 2s ease-out forwards;
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

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    setLoading(true)
    try {
      // ── TODO: Replace with real API call (POST /api/auth/register) ────────
      // const res  = await fetch('/api/auth/register', {
      //   method:  'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body:    JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password }),
      // })
      // if (!res.ok) throw new Error((await res.json()).message)
      // ──────────────────────────────────────────────────────────────────────

      // Clear any previous session/local data to ensure a fresh start
      localStorage.removeItem('token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userProfile')
      localStorage.removeItem('otpVerified')
      sessionStorage.clear()

      // Save data needed by /complete-profile and further pages
      const payload = {
        fullName: form.fullName,
        email:    form.email,
        password: form.password, // remove if your backend handles auth tokens instead
        phone:    '',            // placeholder — filled on /complete-profile
      }
      sessionStorage.setItem('tempProfile', JSON.stringify(payload))

      navigate('/complete-profile')

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
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
        .register-page { font-family: 'Poppins', sans-serif; }

        @keyframes flyPlaneReg {
          0%   { top:-25px; left:-25px;                          transform:rotate(45deg);  }
          25%  { top:-25px; left:calc(100% - 10px);             transform:rotate(135deg); }
          50%  { top:calc(100% - 20px); left:calc(100% - 10px); transform:rotate(225deg); }
          75%  { top:calc(100% - 20px); left:-25px;             transform:rotate(315deg); }
          100% { top:-25px; left:-25px;                          transform:rotate(405deg); }
        }
        @keyframes smokeRegister {
          0%   { opacity:1; transform:scale(1);  }
          100% { opacity:0; transform:scale(3);  }
        }
        @keyframes pulseBtnReg {
          0%,100% { box-shadow:0 0 0 rgba(255,200,100,0.4);  }
          50%     { box-shadow:0 0 20px rgba(255,200,100,0.7); }
        }
        @keyframes pwPanelIn {
          from { opacity:0; transform:translateX(12px) scale(0.97); }
          to   { opacity:1; transform:translateX(0)    scale(1);    }
        }

        .reg-submit-btn {
          animation: pulseBtnReg 2.5s infinite;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .reg-submit-btn:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 0 18px rgba(255,200,100,0.7) !important;
        }
        .reg-field:focus {
          background: rgba(255,255,255,0.92) !important;
          box-shadow: 0 0 8px rgba(255,200,150,0.8) !important;
        }
        .reg-switch-link {
          color: #e6c225;
          text-decoration: none;
          font-weight: bold;
        }
        .reg-switch-link:hover { text-decoration: underline; }

        /* Password strength panel */
        .pw-panel {
          animation: pwPanelIn 0.3s cubic-bezier(.34,1.56,.64,1) both;
        }
        .pw-check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 10px;
          margin-bottom: 6px;
          transition: background 0.2s;
          font-size: 13px;
          font-weight: 500;
        }
        .pw-check-row.done { background: rgba(255,255,255,0.18); color:#fff; }
        .pw-check-row.fail { background: rgba(255,255,255,0.07); color:rgba(255,255,255,0.55); }
        .pw-check-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0;
          transition: all 0.25s;
        }
        .pw-check-icon.done { background:rgba(255,255,255,0.9); color:#2F80ED; font-weight:700; }
        .pw-check-icon.fail { background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.4); }
        .pw-bar-track {
          height: 5px;
          border-radius: 10px;
          background: rgba(255,255,255,0.15);
          overflow: hidden;
          margin-top: 2px;
        }
        .pw-bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.4s ease, background 0.4s ease;
        }
      `}</style>

      {/* ── Page wrapper ──────────────────────────────────────────────────── */}
      <div
        className="register-page"
        style={{
          minHeight: '100vh',
          padding: '20px',
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
          id="particles-js-register"
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        />

        {/* Outer flex: card + strength panel side-by-side */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative', zIndex: 2 }}>

          {/* ── Glassmorphism card ──────────────────────────────────────── */}
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
                animation: 'flyPlaneReg 12s linear infinite',
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
              Create Account
            </h2>
            <p style={{
              marginBottom: '22px',
              fontSize: '14px',
              color: '#3f3f3f',
              opacity: 0.9,
              fontFamily: 'Poppins, sans-serif',
            }}>
              Join Roadna and start your journey
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

              {/* Full Name */}
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label htmlFor="reg-fullName" style={labelStyle}>Full Name</label>
                <input
                  id="reg-fullName"
                  className="reg-field"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label htmlFor="reg-email" style={labelStyle}>Email</label>
                <input
                  id="reg-email"
                  className="reg-field"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Password — triggers strength panel on focus */}
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label htmlFor="reg-password" style={labelStyle}>Password</label>
                <input
                  id="reg-password"
                  className="reg-field"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setTimeout(() => setPwFocused(false), 200)}
                  placeholder="Enter your password"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label htmlFor="reg-confirmPassword" style={labelStyle}>Confirm Password</label>
                <input
                  id="reg-confirmPassword"
                  className="reg-field"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Submit */}
              <button
                id="reg-submit"
                type="submit"
                className="reg-submit-btn"
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
                {loading ? 'Registering…' : 'Register'}
              </button>
            </form>

            {/* Switch to login */}
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#555',
              fontFamily: 'Poppins, sans-serif',
            }}>
              Already have an account?{' '}
              <Link to="/login" className="reg-switch-link">Login</Link>
            </div>

            {/* Quick Access */}
            <div style={{
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.3)',
            }}>
              <p style={{ fontSize: '13px', marginBottom: '10px', color: '#3f3f3f' }}>
                Just want to explore?
              </p>
              <div style={{ fontSize: '14px', color: '#555' }}>
                <Link to="/complete-profile" className="reg-switch-link">
                  Go to Profile Directly
                </Link>
              </div>
            </div>

          </div>{/* end glassmorphism card */}

          {/* ── Password strength panel (appears beside card) ────────────── */}
          {showPanel && (
            <div
              className="pw-panel"
              style={{
                width: 240,
                flexShrink: 0,
                background: 'linear-gradient(160deg, rgba(76,184,231,0.28) 0%, rgba(47,128,237,0.38) 50%, rgba(99,72,221,0.32) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 20,
                padding: '22px 18px',
                boxShadow: '0 8px 40px rgba(47,128,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                color: '#fff',
                fontFamily: 'Poppins, sans-serif',
                alignSelf: 'center',
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>🔐</div>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', margin: 0 }}>
                  Password Strength
                </p>
                <p style={{ fontSize: 11, opacity: 0.6, margin: '3px 0 0', lineHeight: 1.4 }}>
                  Your password must include all of the following:
                </p>
              </div>

              {/* Strength bar */}
              <div className="pw-bar-track" style={{ marginBottom: 14 }}>
                <div
                  className="pw-bar-fill"
                  style={{
                    width: `${(pwScore / 4) * 100}%`,
                    background:
                      pwScore <= 1 ? 'linear-gradient(90deg,#f87171,#fb923c)'
                      : pwScore === 2 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                      : pwScore === 3 ? 'linear-gradient(90deg,#34d399,#10b981)'
                      : 'linear-gradient(90deg,#38bdf8,#818cf8)',
                  }}
                />
              </div>

              {/* Check rows */}
              {[
                { key: 'length',    icon: '📏', label: 'At least 8 characters'      },
                { key: 'uppercase', icon: '🔠', label: 'One uppercase letter (A–Z)' },
                { key: 'number',    icon: '🔢', label: 'One number (0–9)'           },
                { key: 'symbol',    icon: '✳️', label: 'One special symbol (!@#…)'  },
              ].map(({ key, icon, label }) => (
                <div key={key} className={`pw-check-row ${pwChecks[key] ? 'done' : 'fail'}`}>
                  <div className={`pw-check-icon ${pwChecks[key] ? 'done' : 'fail'}`}>
                    {pwChecks[key] ? '✓' : '○'}
                  </div>
                  <span>{icon} {label}</span>
                </div>
              ))}

              {/* Status message */}
              <div style={{
                marginTop: 12,
                padding: '8px 12px',
                borderRadius: 10,
                background: pwScore === 4 ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${pwScore === 4 ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.1)'}`,
                fontSize: 12,
                textAlign: 'center',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}>
                {pwScore === 0 && '🔴 Very Weak'}
                {pwScore === 1 && '🟠 Weak'}
                {pwScore === 2 && '🟡 Fair'}
                {pwScore === 3 && '🟢 Almost There!'}
                {pwScore === 4 && '✨ Strong Password!'}
              </div>
            </div>
          )}

        </div>{/* end outer flex */}
      </div>
    </>
  )
}
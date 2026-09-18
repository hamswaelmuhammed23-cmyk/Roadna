import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategoryIcon } from '../../utils/categoryIcons'

/**
 * CompleteProfile.jsx
 *
 * Collects extended user data after registration.
 * Merges with existing tempProfile from sessionStorage.
 * Saves merged data back to sessionStorage as "tempProfile".
 * Then sends OTP and navigates to /otp for verification.
 *
 * Design: glassmorphism card, animated ✈️ plane + smoke trail, particles.js background.
 *
 * TODO: Replace sessionStorage save with real API call (PATCH /api/users/profile).
 */

const INTEREST_OPTIONS = [
  { id: 'documentary', value: 'Documentary' },
  { id: 'medical', value: 'Medical' },
  { id: 'entertainment', value: 'Entertainment' },
  { id: 'business', value: 'Business' },
  { id: 'culture', value: 'Culture' },
  { id: 'sport', value: 'Sport' },
  { id: 'education', value: 'Education' },
  { id: 'music', value: 'Music' },
  { id: 'comedy', value: 'Comedy' },
  { id: 'arts', value: 'Arts' },
  { id: 'trade-shows', value: 'Trade Shows' },
  { id: 'technology', value: 'Technology' },
  { id: 'adventure', value: 'Adventure' },
  { id: 'dance', value: 'Dance' },
]

const COUNTRIES = ['Egypt', 'Saudi Arabia', 'UAE', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Other']
const LANGUAGES = ['Arabic', 'English', 'French', 'German', 'Spanish', 'Other']

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  marginBottom: '5px',
  color: '#2b3a55',
  fontWeight: 500,
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: 'none',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.6)',
  color: '#1d3746',
  transition: 'background 0.3s ease, box-shadow 0.3s ease',
  fontSize: '14px',
  fontFamily: 'Poppins, sans-serif',
}

function formatPhone(phone) {
  if (!phone) return null
  const t = phone.trim()
  if (t.startsWith('+')) return t
  if (t.startsWith('0')) return '+2' + t   // Egyptian local → E.164
  return '+' + t
}

export default function CompleteProfile() {
  const navigate = useNavigate()

  // Read once at mount — fullName / name comes from Register's payload
  const existing = JSON.parse(sessionStorage.getItem('tempProfile') || '{}')

  const [form, setForm] = useState({
    name: existing.fullName || existing.name || '',
    phone: existing.phone || '',
    dob: existing.dob || '',
    age: existing.age || '',
    language: existing.language || '',
    country: existing.country || '',
    bio: existing.bio || '',
    interests: existing.interests || [],
    photo: existing.photo || null,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(existing.photo || null)

  const planeRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setLoading(true)
      fetch('/api/v1/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.user) {
          const u = data.data.user
          setForm({
            name: u.fullName || u.name || '',
            phone: u.phone || '',
            dob: u.dob ? u.dob.split('T')[0] : '',
            age: u.age || '',
            language: u.language || '',
            country: u.country || '',
            bio: u.bio || '',
            interests: u.interests || [],
            photo: u.photo || null
          })
          if (u.photo) {
            setPreviewUrl(u.photo)
          }
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err)
      })
      .finally(() => {
        setLoading(false)
      })
    }
  }, [])

  // ── Load particles.js from CDN once ──────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('particles-script-cp')) return
    const script = document.createElement('script')
    script.id = 'particles-script-cp'
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
    script.async = true
    script.onload = () => {
      window.particlesJS?.('particles-js-cp', {
        particles: {
          number: { value: 90 },
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

  // ── Smoke trail attached to the animated plane ────────────────────────────
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
        animation:smokeTrailCP 2s ease-out forwards;
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

  function toggleInterest(value) {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter(i => i !== value)
        : [...prev.interests, value],
    }))
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setPreviewUrl(ev.target.result)
      setForm(prev => ({ ...prev, photo: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // ── Validation ────────────────────────────────────────────────────────
    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)

    const token = localStorage.getItem('token')
    if (token) {
      try {
        const interests = form.interests.length > 0 ? form.interests : ['Travel']
        const payload = {
          fullName: form.name,
          phone: form.phone,
          dob: form.dob,
          age: form.age,
          language: form.language,
          country: form.country,
          bio: form.bio,
          interests,
          photo: form.photo,
        }
        const res = await fetch('/api/v1/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (res.ok && data.success) {
          const updatedUser = data.data.user
          updatedUser.name = updatedUser.fullName || updatedUser.name
          localStorage.setItem('userProfile', JSON.stringify(updatedUser))
          navigate('/profile')
        } else {
          setError(data.error || 'Failed to update profile.')
        }
      } catch (err) {
        console.error('Error updating profile:', err)
        setError('Could not update profile. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    // ── STEP 1: Save profile — this must succeed before we do anything else ─
    try {
      const stored = JSON.parse(sessionStorage.getItem('tempProfile') || '{}')
      const interests = form.interests.length > 0 ? form.interests : ['Travel']

      const merged = {
        ...stored,
        fullName: form.name,
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        age: form.age,
        language: form.language,
        country: form.country,
        bio: form.bio,
        interests,
        photo: form.photo,
      }

      sessionStorage.setItem('tempProfile', JSON.stringify(merged))
      console.log('✅ Profile saved:', merged)

    } catch (saveErr) {
      console.error('❌ sessionStorage save failed:', saveErr)
      setError('Could not save your profile. Please try again.')
      setLoading(false)
      return   // stop here — do not proceed
    }

    // ── STEP 2: Send OTP — a failure here is a soft warning, not a blocker ─


    // ── STEP 3: Always navigate — profile is saved regardless of OTP ──────
    navigate('/otp')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Page-scoped CSS ─────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        .cp-page { font-family: 'Poppins', sans-serif; }

        @keyframes flyPlaneCP {
          0%   { top:-25px; left:-25px;                          transform:rotate(45deg);  }
          25%  { top:-25px; left:calc(100% - 10px);             transform:rotate(135deg); }
          50%  { top:calc(100% - 20px); left:calc(100% - 10px); transform:rotate(225deg); }
          75%  { top:calc(100% - 20px); left:-25px;             transform:rotate(315deg); }
          100% { top:-25px; left:-25px;                          transform:rotate(405deg); }
        }
        @keyframes smokeTrailCP {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(3); }
        }
        @keyframes pulseBtnCP {
          0%,100% { box-shadow:0 0 0 rgba(255,200,100,0.4); }
          50%     { box-shadow:0 0 20px rgba(255,200,100,0.7); }
        }

        .cp-submit-btn {
          animation: pulseBtnCP 2.5s infinite;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .cp-submit-btn:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 0 18px rgba(255,200,100,0.7) !important;
        }
        .cp-field:focus {
          background: rgba(255,255,255,0.9) !important;
          box-shadow: 0 0 8px rgba(255,200,150,0.8) !important;
          outline: none !important;
        }
        .cp-photo-box:hover {
          border-color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.18) !important;
        }
        .cp-interest-label:hover {
          background: rgba(255,255,255,0.3) !important;
        }
      `}</style>

      {/* ── Page wrapper ─────────────────────────────────────────────────── */}
      <div
        className="cp-page"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4CB8E7 0%, #2F80ED 100%)',
          padding: '20px',
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        {/* Particles background */}
        <div
          id="particles-js-cp"
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        />

        {/* ── Glassmorphism card ──────────────────────────────────────────── */}
        <div
          ref={containerRef}
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderRadius: '25px',
            padding: '40px',
            width: '700px',
            maxWidth: '95%',
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            position: 'relative',
            zIndex: 2,
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          {/* Animated plane */}
          <div
            ref={planeRef}
            style={{
              fontSize: '36px',
              position: 'absolute',
              top: '-25px',
              left: '-25px',
              animation: 'flyPlaneCP 12s linear infinite',
              zIndex: 4,
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
            }}
          >
            ✈️
          </div>

          <h2 style={{ marginBottom: '8px', fontSize: '26px', color: '#2b3a55', letterSpacing: '1px' }}>
            Complete Your Profile
          </h2>
          <p style={{ marginBottom: '24px', fontSize: '14px', color: '#3f3f3f', opacity: 0.9 }}>
            Add your details and interests to personalize your experience
          </p>

          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'rgba(255,80,80,0.22)',
              border: '1px solid rgba(255,80,80,0.4)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              textAlign: 'left',
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Two-column layout: photo | fields ─────────────────────── */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

              {/* Photo upload */}
              <div style={{ flex: '1', minWidth: '130px', textAlign: 'center' }}>
                <div
                  className="cp-photo-box"
                  onClick={() => document.getElementById('cp-photo-input').click()}
                  style={{
                    border: '2px dashed rgba(255,255,255,0.5)',
                    borderRadius: '15px',
                    padding: '28px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginBottom: '10px',
                    background: 'rgba(255,255,255,0.10)',
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '120px', height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        margin: '0 auto 8px',
                        border: '3px solid rgba(255,255,255,0.35)',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px', opacity: 0.8 }}>
                      📷
                    </span>
                  )}
                  <div style={{ fontSize: '13px', color: '#2b3a55', fontWeight: 500 }}>
                    {previewUrl ? 'Change photo' : 'Click to upload photo'}
                  </div>
                </div>
                <input
                  id="cp-photo-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Form fields */}
              <div style={{ flex: '2', minWidth: '260px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                  {/* Full Name */}
                  <div style={{ gridColumn: '1/-1', textAlign: 'left' }}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      className="cp-field"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* Phone */}
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      className="cp-field"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      style={inputStyle}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Date of Birth</label>
                    <input
                      className="cp-field"
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  {/* Age */}
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Age</label>
                    <input
                      className="cp-field"
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Enter your age"
                      min={10}
                      max={100}
                      style={inputStyle}
                    />
                  </div>

                  {/* Language */}
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Language</label>
                    <select
                      className="cp-field"
                      name="language"
                      value={form.language}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select language</option>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Country */}
                  <div style={{ gridColumn: '1/-1', textAlign: 'left' }}>
                    <label style={labelStyle}>Country</label>
                    <select
                      className="cp-field"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select your country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Bio */}
                  <div style={{ gridColumn: '1/-1', textAlign: 'left' }}>
                    <label style={labelStyle}>Bio</label>
                    <textarea
                      className="cp-field"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                    />
                  </div>

                  {/* Interests */}
                  <div style={{ gridColumn: '1/-1', textAlign: 'left' }}>
                    <label style={labelStyle}>Interests</label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginTop: '6px',
                    }}>
                      {INTEREST_OPTIONS.map(({ id, value, icon }) => {
                        const checked = form.interests.includes(value)
                        return (
                          <label
                            key={id}
                            htmlFor={id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: '1px solid #e5e7eb',
                              backgroundColor: 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#1d3746',
                              flexShrink: 0,
                            }}
                          >
                            <input
                              type="checkbox"
                              id={id}
                              name="interests"
                              value={value}
                              checked={checked}
                              onChange={() => toggleInterest(value)}
                              style={{
                                cursor: 'pointer',
                                accentColor: '#f7971e',
                                flexShrink: 0,
                              }}
                            />
                            <CategoryIcon category={value} className={`w-4 h-4 ${checked ? 'text-[#2F80ED]' : 'text-gray-500'}`} />
                            {value}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              id="complete-profile-submit"
              type="submit"
              className="cp-submit-btn"
              style={{
                width: '100%',
                padding: '13px',
                border: 'none',
                borderRadius: '10px',
                background: 'linear-gradient(135deg,#f7971e,#ffd200)',
                color: '#333',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '26px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Continue →
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
            <a
              href="#"
              onClick={e => { e.preventDefault(); navigate('/') }}
              style={{ color: '#e6c225', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Back to Register
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

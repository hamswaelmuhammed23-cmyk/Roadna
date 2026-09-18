import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * IdentityVerification.jsx
 *
 * Collects National ID number + front/back photos for verification.
 * Reads tempProfile from sessionStorage to pre-fill DOB & Country preview.
 * On submit: calls /api/v1/auth/register, saves token, navigates to /explore.
 *
 * TODO: Implement real file upload (POST /api/users/verify-identity).
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
  fontWeight: 500,
}

// ── Safe JSON parser — never throws ──────────────────────────────────────────
async function safeJson(res) {
  const text = await res.text()
  if (!text || !text.trim()) return {}            // empty body
  try { return JSON.parse(text) }
  catch {
    // Server returned HTML or plain text — surface it for debugging
    console.error('Non-JSON response body:', text.slice(0, 300))
    throw new Error(
      `Server error ${res.status}: response was not JSON.\n` +
      `Check the console for the raw response.`
    )
  }
}

export default function IdentityVerification() {
  const navigate = useNavigate()

  const tempProfile = JSON.parse(sessionStorage.getItem('tempProfile') || '{}')

  const [form, setForm] = useState({
    nationalId: '',
    idFrontFile: null,
    idBackFile: null,
  })

  const [extracted] = useState({
    dob: tempProfile.dob || '-',
    country: tempProfile.country || '-',
    gender: '-',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: '' })

  const planeRef = useRef(null)
  const containerRef = useRef(null)

  // ── Load particles.js ─────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('particles-script-iv')) return
    const script = document.createElement('script')
    script.id = 'particles-script-iv'
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
    script.async = true
    script.onload = () => {
      window.particlesJS?.('particles-js-iv', {
        particles: {
          number: { value: 100 },
          size: { value: 4 },
          color: { value: '#ffffff' },
          opacity: { value: 0.8 },
          move: { speed: 2.5 },
          line_linked: { enable: true, opacity: 0.5 },
        },
        interactivity: {
          events: { onhover: { enable: true, mode: 'repulse' } },
        },
        retina_detect: true,
      })
    }
    document.body.appendChild(script)
    return () => {
      try { window.pJSDom?.[0]?.pJS?.fn?.vendors?.destroypJS?.() } catch { /* ignore */ }
    }
  }, [])

  // ── Smoke trail ───────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const plane = planeRef.current
      const container = containerRef.current
      if (!plane || !container) return
      const pr = plane.getBoundingClientRect()
      const cr = container.getBoundingClientRect()
      const smoke = document.createElement('div')
      smoke.style.cssText = `
        position:absolute; width:14px; height:14px; border-radius:50%;
        background:radial-gradient(circle,rgba(255,255,255,1),rgba(173,216,230,0.3));
        pointer-events:none; filter:blur(1px); z-index:3;
        left:${pr.left - cr.left + 10}px; top:${pr.top - cr.top + 10}px;
        animation:smokeIV 2s ease-out forwards;
      `
      container.appendChild(smoke)
      setTimeout(() => smoke.remove(), 2000)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg, isError = false) {
    setToast({ msg, type: isError ? 'error' : 'success' })
    setTimeout(() => setToast({ msg: '', type: '' }), 4000)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleFileChange(e) {
    const { name, files } = e.target
    const file = files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result

      setForm(prev => ({
        ...prev,
        [name]: base64,
      }))
    }
    reader.readAsDataURL(file)

  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.nationalId.trim()) {
      setError('Please enter your National ID number.')
      return
    }
    if (!form.idFrontFile || !form.idBackFile) {
      setError('Please upload both front and back photos of your ID.')
      return
    }

    setLoading(true)
    try {
      const stored = JSON.parse(sessionStorage.getItem('tempProfile') || '{}')
      console.log('📦 tempProfile being sent:', stored)

      const payload = {
        fullName: stored.fullName,
        email: stored.email,
        password: stored.password,
        phone: stored.phone,
        dob: stored.dob,
        age: stored.age,
        language: stored.language,
        country: stored.country,
        bio: stored.bio,
        interests: stored.interests,
        nationalId: form.nationalId,
        idFront: form.idFrontFile, // <-- add front image base64
        idBack: form.idBackFile,  // <-- add back image base64
      }
      console.log('📤 Payload:', payload)

      // ── API call ──────────────────────────────────────────────────────────
      let res
      try {
        res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (networkErr) {
        // Fetch itself failed — no connection at all
        throw new Error('Cannot reach the server. Check your connection or that the backend is running.')
      }

      // ── Safe JSON parse — this was the crash ─────────────────────────────
      const data = await safeJson(res)
      console.log('✅ Server response:', res.status, data)

      if (!res.ok) {
        // Surface the specific backend error message if available
        throw new Error(
          data.error || data.message || data.msg ||
          `Registration failed (HTTP ${res.status})`
        )
      }

      // Some backends use data.success, some just rely on res.ok — handle both
      if (data.success === false) {
        throw new Error(data.error || data.message || 'Registration failed')
      }

      // ── Success ───────────────────────────────────────────────────────────
      const token = data.data?.token || data.token || ''
      if (token) localStorage.setItem('token', token)

      localStorage.setItem('userProfile', JSON.stringify({
        ...stored,
        nationalId: form.nationalId,
        identityStatus: 'verified',
      }))
      sessionStorage.clear()

      showToast('✅ Verification submitted successfully!')
      setTimeout(() => navigate('/explore', { replace: true }), 1300)

    } catch (err) {
      console.error('❌ Submit error:', err)
      setError(err.message || 'Submission failed. Please try again.')
      showToast(err.message || '❌ Submission failed.', true)
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        .iv-page { font-family: 'Poppins', sans-serif; }

        @keyframes flyPlaneIV {
          0%   { top:-25px; left:-25px;                          transform:rotate(45deg);  }
          25%  { top:-25px; left:calc(100% - 10px);             transform:rotate(135deg); }
          50%  { top:calc(100% - 20px); left:calc(100% - 10px); transform:rotate(225deg); }
          75%  { top:calc(100% - 20px); left:-25px;             transform:rotate(315deg); }
          100% { top:-25px; left:-25px;                          transform:rotate(405deg); }
        }
        @keyframes smokeIV {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(3); }
        }
        @keyframes pulseBtnIV {
          0%,100% { box-shadow:0 0 0 rgba(255,200,100,0.4); }
          50%     { box-shadow:0 0 20px rgba(255,200,100,0.7); }
        }
        .iv-submit-btn {
          animation: pulseBtnIV 2.5s infinite;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .iv-submit-btn:hover:not(:disabled) {
          transform: scale(1.05) !important;
          box-shadow: 0 0 18px rgba(255,200,100,0.7) !important;
        }
        .iv-field:focus {
          background: rgba(255,255,255,0.92) !important;
          box-shadow: 0 0 8px rgba(255,200,150,0.8) !important;
        }
        .iv-file-input {
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-radius: 10px;
          background: rgba(255,255,255,0.6);
          color: #1d3746;
          cursor: pointer;
          font-size: 13px;
          font-family: 'Poppins', sans-serif;
          transition: background 0.3s;
        }
        .iv-file-input:hover { background: rgba(255,255,255,0.8); }
        .iv-file-input::file-selector-button {
          background: linear-gradient(135deg,#f7971e,#ffd200);
          border: none;
          border-radius: 7px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 10px;
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <div
        className="iv-page"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4CB8E7 0%, #2F80ED 100%)',
          overflow: 'hidden',
          position: 'relative',
          padding: '20px',
        }}
      >
        <div
          id="particles-js-iv"
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        />

        {/* Toast */}
        <div style={{
          position: 'fixed', bottom: '30px', left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? 'rgba(220,53,69,0.95)' : 'rgba(40,167,69,0.95)',
          color: '#fff', padding: '12px 28px', borderRadius: '30px',
          fontSize: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 100, opacity: toast.msg ? 1 : 0, transition: 'opacity 0.4s',
          pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif',
        }}>
          {toast.msg}
        </div>

        {/* Card */}
        <div
          ref={containerRef}
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderRadius: '25px',
            padding: '35px',
            width: '450px',
            maxWidth: '92vw',
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Plane */}
          <div ref={planeRef} style={{
            fontSize: '32px', position: 'absolute', top: '-25px', left: '-25px',
            animation: 'flyPlaneIV 12s linear infinite', zIndex: 4,
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
          }}>✈️</div>

          <h2 style={{
            marginBottom: '10px', fontSize: '26px', color: '#2b3a55',
            letterSpacing: '1px', fontFamily: 'Poppins, sans-serif', fontWeight: 600,
          }}>
            Identity Verification
          </h2>
          <p style={{
            marginBottom: '22px', fontSize: '14px', color: '#3f3f3f',
            opacity: 0.9, fontFamily: 'Poppins, sans-serif',
          }}>
            Please provide your details to verify your account.
          </p>

          {/* Inline error */}
          {error && (
            <div style={{
              marginBottom: '14px', padding: '10px 14px',
              background: 'rgba(255,80,80,0.22)',
              border: '1px solid rgba(255,80,80,0.4)',
              borderRadius: '10px', color: '#fff',
              fontSize: '13px', textAlign: 'left',
              fontFamily: 'Poppins, sans-serif',
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* National ID */}
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={labelStyle}>National ID Number</label>
              <input
                id="national-id"
                className="iv-field"
                type="text"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                placeholder="Enter National ID"
                required
                style={inputStyle}
              />
            </div>

            {/* Upload front & back */}
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={labelStyle}>Upload ID Card (Front &amp; Back)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="id-front"
                  className="iv-file-input"
                  type="file"
                  name="idFrontFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '50%' }}
                />
                <input
                  id="id-back"
                  className="iv-file-input"
                  type="file"
                  name="idBackFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '50%' }}
                />
              </div>
              <p style={{
                marginTop: '6px', fontSize: '11px',
                color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins, sans-serif',
              }}>
                Left: Front side &nbsp;|&nbsp; Right: Back side
              </p>
            </div>

            {/* Submit */}
            <button
              id="identity-submit"
              type="submit"
              className="iv-submit-btn"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', border: 'none',
                borderRadius: '10px',
                background: 'linear-gradient(135deg,#f7971e,#ffd200)',
                color: '#333', fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                marginTop: '6px', fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting…' : 'Submit Verification'}
            </button>
          </form>

          {/* Extracted data preview */}
          <div style={{
            marginTop: '22px',
            background: 'rgba(255,255,255,0.15)',
            padding: '15px 18px', borderRadius: '12px',
            textAlign: 'left', fontSize: '14px',
            color: '#2b3a55', fontFamily: 'Poppins, sans-serif',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: '#2b3a55' }}>
              Extracted Data Preview
            </div>
            <div style={{ display: 'grid', rowGap: '4px' }}>
              <span>📅 Date of Birth: <strong>{extracted.dob}</strong></span>
              <span>🌍 Country: <strong>{extracted.country}</strong></span>
              <span>👤 Gender: <strong>{extracted.gender}</strong></span>
            </div>
            <p style={{
              marginTop: '8px', fontSize: '11px',
              color: 'rgba(43,58,85,0.65)',
            }}>
              Data will be updated after ID upload &amp; AI extraction.
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
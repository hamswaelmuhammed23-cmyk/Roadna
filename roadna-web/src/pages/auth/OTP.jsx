import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const OTP_LENGTH     = 4
const RESEND_SECONDS = 60

function formatPhone(phone) {
  if (!phone) return null
  const t = phone.trim()
  if (t.startsWith('+')) return t
  if (t.startsWith('0')) return '+2' + t
  return '+' + t
}

export default function OTP() {
  const navigate = useNavigate()

  const [digits,   setDigits]   = useState(Array(OTP_LENGTH).fill(''))
  const [cooldown, setCooldown] = useState(0)          // starts at 0 — set after OTP sent
  const [toast,    setToast]    = useState({ msg: '', type: '' })
  const [loading,  setLoading]  = useState(false)
  const [sending,  setSending]  = useState(true)       // true while initial OTP is in-flight

  const inputRefs    = useRef([])
  const planeRef     = useRef(null)
  const containerRef = useRef(null)

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getPhone() {
    const stored = JSON.parse(sessionStorage.getItem('tempProfile') || '{}')
    return formatPhone(stored.phone)
  }

  const rawPhone = JSON.parse(sessionStorage.getItem('tempProfile') || '{}').phone
  const phoneDisplay = rawPhone
    ? `We sent a 4-digit code to ${rawPhone}`
    : 'Enter the 4-digit code we sent to your phone'

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, type: isError ? 'error' : 'success' })
    setTimeout(() => setToast({ msg: '', type: '' }), 3500)
  }, [])

  // ── Shared OTP request function ───────────────────────────────────────────
  async function requestOtp(phone) {
    const res = await fetch('/api/v1/auth/request-phone-otp', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone }),
    })

    let data = {}
    try { data = await res.json() } catch { /* non-JSON body — ignore */ }

    if (!res.ok) throw new Error(data.error || data.message || `OTP request failed (${res.status})`)
    return data
  }

  // ── On mount: guard + send OTP ────────────────────────────────────────────
  useEffect(() => {
    if (!sessionStorage.getItem('tempProfile')) {
      navigate('/complete-profile', { replace: true })
      return
    }

    inputRefs.current[0]?.focus()

    const phone = getPhone()
    if (!phone) {
      setSending(false)
      showToast('No phone number found — please go back and add one.', true)
      return
    }

    // ── Send OTP immediately on mount ─────────────────────────────────────
    setSending(true)
    requestOtp(phone)
      .then(() => {
        showToast('✅ OTP sent to your phone!')
        setCooldown(RESEND_SECONDS)   // start countdown only after successful send
      })
      .catch(err => {
        showToast(`❌ Could not send OTP: ${err.message}`, true)
      })
      .finally(() => {
        setSending(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Particles ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('particles-script-otp')) return
    const script    = document.createElement('script')
    script.id       = 'particles-script-otp'
    script.src      = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
    script.async    = true
    script.onload   = () => {
      window.particlesJS?.('particles-js-otp', {
        particles: {
          number:      { value: 90 },
          size:        { value: 4 },
          color:       { value: '#ffffff' },
          opacity:     { value: 0.8 },
          move:        { speed: 2.5 },
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
      const plane     = planeRef.current
      const container = containerRef.current
      if (!plane || !container) return
      const pr    = plane.getBoundingClientRect()
      const cr    = container.getBoundingClientRect()
      const smoke = document.createElement('div')
      smoke.style.cssText = `
        position:absolute; width:14px; height:14px; border-radius:50%;
        background:radial-gradient(circle,rgba(255,255,255,1),rgba(173,216,230,0.3));
        pointer-events:none; filter:blur(1px); z-index:3;
        left:${pr.left - cr.left + 10}px; top:${pr.top - cr.top + 10}px;
        animation:smokeOTP 2s ease-out forwards;
      `
      container.appendChild(smoke)
      setTimeout(() => smoke.remove(), 2000)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // ── Cooldown ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // ── Enter key ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = e => { if (e.key === 'Enter') handleVerify() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [digits]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Input handlers ────────────────────────────────────────────────────────
  function handleChange(index, value) {
    const clean   = value.replace(/\D/g, '').slice(-1)
    const updated = [...digits]
    updated[index] = clean
    setDigits(updated)
    if (clean && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const text    = (e.clipboardData || window.clipboardData)
      .getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const updated = Array(OTP_LENGTH).fill('')
    text.split('').forEach((ch, i) => { updated[i] = ch })
    setDigits(updated)
    const last = Math.min(text.length, OTP_LENGTH) - 1
    if (last >= 0) inputRefs.current[last]?.focus()
  }

  // ── Verify ────────────────────────────────────────────────────────────────
  async function handleVerify() {
    const code  = digits.join('')
    const phone = getPhone()

    if (code.length < OTP_LENGTH) {
      showToast('Please enter the complete 4-digit code', true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/verify-phone-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, code }),
      })

      let data = {}
      try { data = await res.json() } catch { /* ignore */ }

      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid OTP')

      sessionStorage.setItem('otpVerified', 'true')
      localStorage.setItem('otpVerified', 'true')
      showToast('✅ Phone verified successfully!')
      setTimeout(() => navigate('/identity', { replace: true }), 1200)

    } catch (err) {
      showToast(err.message || 'Verification failed', true)
    } finally {
      setLoading(false)
    }
  }

  // ── Resend ────────────────────────────────────────────────────────────────
  async function handleResend() {
    if (cooldown > 0) return

    setDigits(Array(OTP_LENGTH).fill(''))
    inputRefs.current[0]?.focus()

    const phone = getPhone()
    try {
      await requestOtp(phone)
      showToast('✅ New OTP sent!')
      setCooldown(RESEND_SECONDS)
    } catch (err) {
      showToast(`❌ ${err.message}`, true)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        .otp-page { font-family: 'Poppins', sans-serif; }

        @keyframes floatCardOTP {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-15px); }
        }
        @keyframes flyPlaneOTP {
          0%   { top:-25px; left:-25px;                          transform:rotate(45deg);  }
          25%  { top:-25px; left:calc(100% - 10px);             transform:rotate(135deg); }
          50%  { top:calc(100% - 20px); left:calc(100% - 10px); transform:rotate(225deg); }
          75%  { top:calc(100% - 20px); left:-25px;             transform:rotate(315deg); }
          100% { top:-25px; left:-25px;                          transform:rotate(405deg); }
        }
        @keyframes smokeOTP {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(3); }
        }
        .otp-digit:focus {
          background: rgba(255,255,255,0.95) !important;
          box-shadow: 0 0 8px rgba(255,200,100,0.8) !important;
          outline: none !important;
        }
        .otp-verify-btn:hover:not(:disabled) {
          box-shadow: 0 0 15px rgba(255,200,100,0.7) !important;
        }
      `}</style>

      <div
        className="otp-page"
        style={{
          height: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4CB8E7 0%, #2F80ED 100%)',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <div id="particles-js-otp" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

        {/* Toast */}
        <div style={{
          position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? 'rgba(220,53,69,0.95)' : 'rgba(40,167,69,0.95)',
          color: '#fff', padding: '12px 24px', borderRadius: '30px',
          fontSize: '14px', zIndex: 100, opacity: toast.msg ? 1 : 0,
          transition: 'opacity 0.4s', pointerEvents: 'none',
          whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif',
        }}>
          {toast.msg}
        </div>

        {/* Card */}
        <div
          ref={containerRef}
          style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)', padding: '40px', width: '360px',
            maxWidth: '90vw', textAlign: 'center', borderRadius: '25px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)', position: 'relative',
            zIndex: 2, animation: 'floatCardOTP 6s ease-in-out infinite',
          }}
        >
          {/* Plane */}
          <div ref={planeRef} style={{
            fontSize: '32px', position: 'absolute', top: '-25px', left: '-25px',
            animation: 'flyPlaneOTP 12s linear infinite', zIndex: 3,
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
          }}>✈️</div>

          <h2 style={{ color: '#2b3a55', marginBottom: '10px', fontSize: '22px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
            Verify Your Number
          </h2>

          {/* Show "Sending…" while initial OTP is in-flight */}
          <p style={{ color: '#2b3a55', marginBottom: '24px', fontSize: '14px', opacity: 0.9, fontFamily: 'Poppins, sans-serif' }}>
            {sending ? '📤 Sending code to your phone…' : phoneDisplay}
          </p>

          {/* OTP inputs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '22px' }} onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                className="otp-digit"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={sending}
                style={{
                  width: '54px', height: '54px', fontSize: '22px', textAlign: 'center',
                  border: 'none', borderRadius: '12px',
                  background: sending ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
                  color: '#1d3746', fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>

          {/* Verify */}
          <button
            className="otp-verify-btn"
            onClick={handleVerify}
            disabled={loading || sending}
            style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg,#f7971e,#ffd200)',
              border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600,
              cursor: (loading || sending) ? 'wait' : 'pointer',
              transition: 'box-shadow 0.3s', fontFamily: 'Poppins, sans-serif',
              opacity: (loading || sending) ? 0.7 : 1,
            }}
          >
            {loading ? 'Verifying…' : sending ? 'Sending code…' : 'Verify ✓'}
          </button>

          {/* Skip */}
          <button
            onClick={() => {
              sessionStorage.setItem('otpVerified', 'true')
              localStorage.setItem('otpVerified', 'true')
              navigate('/identity', { replace: true })
            }}
            style={{
              width: '100%', padding: '10px', marginTop: '10px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '12px', fontSize: '14px', color: '#fff',
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            }}
          >
            Skip
          </button>

          {/* Resend */}
          <div
            onClick={handleResend}
            style={{
              marginTop: '16px', color: '#fff', fontSize: '14px',
              cursor: cooldown > 0 ? 'default' : 'pointer',
              opacity: cooldown > 0 ? 0.45 : 0.9,
              transition: 'opacity 0.3s', userSelect: 'none',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {cooldown > 0
              ? <>Resend code in <strong>{cooldown}</strong>s</>
              : 'Resend Code'}
          </div>
        </div>
      </div>
    </>
  )
}
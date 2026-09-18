import TripCard from "../../components/TripCard";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CinematicOverlay from "../../components/cinematic/CinematicOverlay";
import PharaonicStarfield from "../../components/cinematic/PharaonicStarfield";

// ── Mock participants pool (replace with API data when backend is ready) ──
const MOCK_PARTICIPANTS = [
  { userId: 'c1', name: 'Ahmed Ali', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', status: 'Trip Buddy' },
  { userId: 'c2', name: 'Sarah', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', status: 'Trip Buddy' },
  { userId: 'c3', name: 'Ali', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop', status: 'Trip Buddy' },
  { userId: 'c4', name: 'Farah', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', status: 'Trip Buddy' },
  { userId: 'c5', name: 'Omar', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', status: 'Trip Buddy' },
  { userId: 'c6', name: 'Lina Hassan', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop', status: 'Trip Buddy' },
];

/** Pick 2-4 random participants from the pool (deterministic per trip title) */
function getParticipantsForTrip(title) {
  // Use a simple hash of the title to get deterministic but varied picks
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  const count = 2 + (Math.abs(hash) % 3); // 2, 3, or 4 participants
  const shuffled = [...MOCK_PARTICIPANTS].sort((a, b) => {
    const ha = ((hash * 31 + a.userId.charCodeAt(1)) | 0);
    const hb = ((hash * 31 + b.userId.charCodeAt(1)) | 0);
    return ha - hb;
  });
  return shuffled.slice(0, count);
}

// Fallback sample trip (used when page is opened directly without navigation state)
const sampleTrip = {
  title: "Discover the Magic of Siwa Oasis",
  titleHighlight: "Siwa Oasis",
  status: "Booking Open",
  destination: "Siwa Oasis, Egypt",
  startDate: "May 15, 2026",
  endDate: "May 19, 2026",
  durationDays: 5,
  meetingPoint: "Cairo – Tahrir Square, 6:00 AM",
  priceEGP: 4500,
  priceUSD: 92,
  rating: 4.8,
  reviewCount: 124,
  difficulty: "Moderate",
  seatsTotal: 30,
  seatsLeft: 8,
  details: {
    transport: "AC Bus + 4×4 Desert Jeep",
    stay: "Eco-lodge (3 nights) + Camp (1 night)",
    meals: "All meals included",
    guide: "English & Arabic speaking",
  },
  included: [
    { label: "Transportation from Cairo", yes: true },
    { label: "Accommodation", yes: true },
    { label: "All meals & snacks", yes: true },
    { label: "Desert safari", yes: true },
    { label: "Hot spring entry", yes: true },
    { label: "Personal expenses", yes: false },
    { label: "Travel insurance", yes: false },
  ],
  bring: ["Sunscreen", "Comfortable shoes", "Warm jacket", "Swimsuit", "Camera", "Water bottle"],
  organizer: {
    name: "Roadna Adventures",
    contact: "trips@roadna.com · +20 100 123 4567",
  },
};


// ── Background canvas with stars + planes + foam contrails ───────────
function SkyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      base: Math.random() * 0.4 + 0.08,
      speed: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    const shoots = [];
    const shootInterval = setInterval(() => {
      shoots.push({
        x: Math.random() * 0.7 + 0.05,
        y: Math.random() * 0.3,
        speed: 0.004 + Math.random() * 0.003,
        len: 0.07 + Math.random() * 0.07,
        life: 1,
        decay: 0.02 + Math.random() * 0.015,
      });
    }, 2200);

    // Foam/contrail puffs stored per plane
    const planes = Array.from({ length: 6 }, (_, i) => ({
      x: -0.1 - i * 0.18,
      y: 0.08 + Math.random() * 0.78,
      speed: 0.0012 + Math.random() * 0.001,
      size: 18 + Math.random() * 12,
      opacity: 0.55 + Math.random() * 0.35,
      trail: [],
      foam: [],
      blink: Math.random() * Math.PI * 2,
      blinkSpeed: 0.05 + Math.random() * 0.04,
    }));

    const drawPlane = (x, y, sz, op, bl) => {
      const bv = Math.sin(bl) > 0.6 ? 1 : 0;
      ctx.save();
      ctx.globalAlpha = op;
      ctx.translate(x, y);
      ctx.fillStyle = "#dde8f5";
      ctx.beginPath();
      ctx.moveTo(sz, 0);
      ctx.lineTo(-sz * 0.5, sz * 0.28);
      ctx.lineTo(-sz * 0.18, 0);
      ctx.lineTo(-sz * 0.5, -sz * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#bfd4ee";
      ctx.beginPath();
      ctx.moveTo(sz * 0.1, 0);
      ctx.lineTo(-sz * 0.1, sz * 0.52);
      ctx.lineTo(-sz * 0.42, sz * 0.52);
      ctx.lineTo(-sz * 0.38, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sz * 0.1, 0);
      ctx.lineTo(-sz * 0.1, -sz * 0.52);
      ctx.lineTo(-sz * 0.42, -sz * 0.52);
      ctx.lineTo(-sz * 0.38, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#a3bedb";
      ctx.beginPath();
      ctx.moveTo(-sz * 0.3, 0);
      ctx.lineTo(-sz * 0.5, -sz * 0.3);
      ctx.lineTo(-sz * 0.55, 0);
      ctx.closePath();
      ctx.fill();
      if (bv) {
        ctx.globalAlpha = op * 1.5;
        ctx.fillStyle = "#ff4444";
        ctx.beginPath(); ctx.arc(-sz * 0.45, sz * 0.28, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#44ff88";
        ctx.beginPath(); ctx.arc(-sz * 0.45, -sz * 0.28, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    let t = 0;
    let animId;

    const frame = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Deep sky
      const sky = ctx.createLinearGradient(0, 0, W * 0.3, H);
      sky.addColorStop(0, "#122438");
      sky.addColorStop(0.4, "#162e50");
      sky.addColorStop(0.7, "#183a70");
      sky.addColorStop(1, "#142e58");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      t += 0.012;

      // Stars
      stars.forEach((s) => {
        const tw = s.base + Math.sin(t * s.speed + s.phase) * 0.14;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,235,255,${Math.max(0, tw)})`;
        ctx.fill();
      });

      // Shooting stars
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        const sx = s.x * W, sy = s.y * H;
        const ex = sx + s.len * W * 0.7, ey = sy + s.len * H * 0.35;
        const g2 = ctx.createLinearGradient(sx, sy, ex, ey);
        g2.addColorStop(0, "rgba(200,220,255,0)");
        g2.addColorStop(0.4, `rgba(220,235,255,${s.life * 0.7})`);
        g2.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
        ctx.strokeStyle = g2; ctx.lineWidth = 1.5; ctx.stroke();
        s.x += s.speed; s.y += s.speed * 0.5; s.life -= s.decay;
        if (s.life <= 0) shoots.splice(i, 1);
      }

      // Planes + foam contrails
      planes.forEach((p) => {
        const px = p.x * W, py = p.y * H;

        // Add position to trail
        p.trail.push({ x: px, y: py });
        if (p.trail.length > 48) p.trail.shift();

        // Spawn foam puffs at plane tail
        if (Math.random() < 0.35) {
          p.foam.push({
            x: px - p.size * 0.5,
            y: py + (Math.random() - 0.5) * 4,
            r: 4 + Math.random() * 5,
            life: 1,
            decay: 0.007 + Math.random() * 0.005,
            dx: -(0.4 + Math.random() * 0.4),
            dy: (Math.random() - 0.5) * 0.2,
          });
        }

        // Draw foam puffs (behind plane, drawn first)
        for (let i = p.foam.length - 1; i >= 0; i--) {
          const f = p.foam[i];
          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * (2 - f.life));
          grad.addColorStop(0, `rgba(210,230,255,${f.life * 0.3})`);
          grad.addColorStop(0.4, `rgba(190,215,255,${f.life * 0.15})`);
          grad.addColorStop(1, `rgba(150,180,230,0)`);
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * (2 - f.life) * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          f.x += f.dx;
          f.y += f.dy;
          f.r += 0.22;
          f.life -= f.decay;
          if (f.life <= 0) p.foam.splice(i, 1);
        }

        // Draw slim contrail line behind plane
        for (let i = 1; i < p.trail.length; i++) {
          const prog = i / p.trail.length;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = `rgba(200,220,255,${prog * p.opacity * 0.35})`;
          ctx.lineWidth = prog * 1.8;
          ctx.stroke();
        }

        // Draw plane on top
        drawPlane(px, py, p.size, p.opacity, p.blink);

        p.x += p.speed;
        p.blink += p.blinkSpeed;
        if (p.x > 1.12) {
          p.x = -0.12;
          p.y = 0.08 + Math.random() * 0.78;
          p.trail = [];
          p.foam = [];
        }
      });

      animId = requestAnimationFrame(frame);
    };

    frame();
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shootInterval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
      }}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────
// ── Success Modal ─────────────────────────────────────────────────────
function JoinSuccessModal({ trip, mode, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(2,5,16,0.85)',
      backdropFilter: 'blur(12px)',
      animation: 'fadeInModal 0.3s ease-out both',
    }}>
      <style>{`
        @keyframes fadeInModal { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        @keyframes pulseGlow {
          0%,100%{box-shadow:0 0 30px rgba(56,189,248,0.4),0 0 80px rgba(37,99,235,0.3)}
          50%{box-shadow:0 0 60px rgba(56,189,248,0.7),0 0 120px rgba(37,99,235,0.5)}
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg,#0a0f1e 0%,#0d1a2e 50%,#0a0f1e 100%)',
        border: '1px solid rgba(56,189,248,0.25)',
        borderRadius: 28,
        padding: '44px 40px',
        maxWidth: 420,
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: 'pulseGlow 2.5s ease-in-out infinite',
      }}>
        {/* Top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg,#2563eb,#0ea5e9,#38bdf8,#2563eb)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 2s linear infinite',
        }} />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(56,189,248,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Icon */}
        <div style={{
          fontSize: 64,
          marginBottom: 20,
          animation: 'floatUp 2s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.6))',
        }}>
          {mode === 'event' ? '🎫' : '✈️'}
        </div>

        {/* Title */}
        <h2 style={{
          background: 'linear-gradient(135deg,#38bdf8,#3b82f6,#38bdf8)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 2.5s linear infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: 24,
          fontWeight: 800,
          margin: '0 0 10px',
          fontFamily: "'Inter',sans-serif",
          letterSpacing: '-0.02em',
        }}>
          {mode === 'event' ? '🎉 Booked Successfully!' : '🚀 You\'re In!'}
        </h2>

        {/* Subtitle */}
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
          {mode === 'event' ? 'Your spot is confirmed for' : 'You\'ve joined the trip'}
        </p>
        <p style={{
          color: '#e2e8f0',
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 28,
          fontFamily: "'Inter',sans-serif",
          padding: '8px 16px',
          background: 'rgba(56,189,248,0.08)',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 10,
          display: 'inline-block',
        }}>
          {trip.title}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.2),transparent)', margin: '0 0 24px' }} />

        {/* Info row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px', fontFamily: "'Inter',sans-serif" }}>Destination</p>
            <p style={{ color: '#7dd3fc', fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "'Inter',sans-serif" }}>📍 {trip.destination}</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px', fontFamily: "'Inter',sans-serif" }}>Date</p>
            <p style={{ color: '#7dd3fc', fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "'Inter',sans-serif" }}>📅 {trip.startDate}</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px 0',
            background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
            backgroundSize: '200% 200%',
            animation: 'shimmer 2s linear infinite',
            border: 'none',
            borderRadius: 14,
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Inter',sans-serif",
            letterSpacing: '0.02em',
            boxShadow: '0 8px 32px rgba(14,165,233,0.35)',
          }}
        >
          Awesome! 🌟
        </button>
      </div>
    </div>
  );
}

export default function TripDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  // Museum cinematic ONLY shows when explicitly triggered by cultural/arts/documentary trips
  const [showCinematic, setShowCinematic] = useState(
    location.state?.cinematicType === 'museum'
  );
  const handleCinematicDone = useCallback(() => setShowCinematic(false), []);

  // Use trip passed from navigation state
  const mode = location.state?.mode || 'trip';
  const from = location.state?.from || null;
  const trip = location.state?.trip || (mode === 'event' ? null : sampleTrip);

  // Save joined trip/event to localStorage and navigate back
  const handleJoin = async () => {
    if (!trip) return

    const token = localStorage.getItem('token')
    const resolvedId = String(trip.id || trip._id || '')

    if (token && resolvedId) {
      try {
        const endpoint = mode === 'event' ? 'join-event' : 'join-trip'
        const body = mode === 'event'
          ? { eventId: resolvedId }
          : { tripId: resolvedId }

        const res = await fetch(`/api/v1/profile/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!data.success) console.error('Join failed:', data.error)

      } catch (err) {
        console.error('Join request failed:', err)
      }
    }

    setShowSuccess(true)
  }

  // Close modal and go back
  const handleModalClose = () => {
    setShowSuccess(false);
    handleBack();
  };

  // Back button: go to exact source page (preserves tab state)
  const handleBack = () => {
    if (from) {
      navigate(from);
    } else {
      navigate(-1);
    }
  };

  // If event data not found, show fallback message
  if (!trip) {
    return (
      <div style={{ height: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "#94a3b8", fontSize: 18 }}>Event details not found.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: "10px 24px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
        >
          ← Back to Events
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", overflowY: "auto", position: "relative" }}>

      {/* Full-page animated sky — replaced by pharaonic starfield after cinematic */}
      {showCinematic ? <SkyBackground /> : <PharaonicStarfield />}

      {/* Cinematic museum animation overlay */}
      {showCinematic && <CinematicOverlay onComplete={handleCinematicDone} />}

      {/* Page content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        {/* SVG turbulence filter for electric border */}
        <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
          <defs>
            <filter id="turbulent-displace" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
              <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
              <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise3" seed="2" />
              <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise4" seed="2" />
              <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
              <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
              <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />
              <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
            </filter>
          </defs>
        </svg>

        {/* Positioning wrapper for card + side starfields */}
        <div style={{ position: "relative", zoom: "0.76", display: "flex", alignItems: "flex-start", gap: 0 }}>

          {/* Left constellation panel */}
          {!showCinematic && (
            <div style={{ width: 200, alignSelf: "stretch", position: "relative", flexShrink: 0, overflow: "hidden", borderRadius: 12 }}>
              <PharaonicStarfield side="left" />
            </div>
          )}

          {/* Card + electric frame */}
          <div style={{ position: "relative" }}>

            {/* Animated turbulence border — blue */}
            <div style={{
              position: "absolute", inset: -3, borderRadius: "27px",
              border: "2px solid #2e7ab8",
              filter: "url(#turbulent-displace)",
              pointerEvents: "none", zIndex: 10,
            }} />

            {/* Static crisp border — blue */}
            <div style={{
              position: "absolute", inset: -3, borderRadius: "27px",
              border: "2px solid rgba(42,120,200,0.45)",
              pointerEvents: "none", zIndex: 10,
            }} />

            {/* Cyan accent glow */}
            <div style={{
              position: "absolute", inset: -3, borderRadius: "27px",
              border: "2px solid rgba(72,180,221,0.45)",
              filter: "blur(1px)",
              pointerEvents: "none", zIndex: 9,
            }} />

            {/* Blue soft glow */}
            <div style={{
              position: "absolute", inset: -3, borderRadius: "27px",
              border: "2px solid #2e7ab8",
              filter: "blur(5px)",
              pointerEvents: "none", zIndex: 9,
            }} />




            {/* ✅ TripCard — receives dynamic trip data */}
            <TripCard
              trip={trip}
              mode={mode}
              onJoin={handleJoin}
              onBack={handleBack}
            />

            {/* 🎉 Success Modal */}
            {showSuccess && (
              <JoinSuccessModal
                trip={trip}
                mode={mode}
                onClose={handleModalClose}
              />
            )}
          </div>

          {/* Right constellation panel */}
          {!showCinematic && (
            <div style={{ width: 200, alignSelf: "stretch", position: "relative", flexShrink: 0, overflow: "hidden", borderRadius: 12 }}>
              <PharaonicStarfield side="right" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

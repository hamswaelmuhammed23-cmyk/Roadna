import { useEffect, useRef } from "react";

/**
 * TripCard Component
 *
 * Props:
 * @param {Object} trip - Trip data object
 * @param {Function} onJoin - Called when "Join Now" is clicked
 * @param {Function} onBack - Called when "Back to Trips" is clicked
 */

export default function TripCard({ trip, onJoin, onBack, mode = 'trip' }) {
  const canvasRef = useRef(null);

  // ── Canvas sky animation ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.55,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.45 + 0.12,
      speed: Math.random() * 0.8 + 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const shoots = [];
    const shootInterval = setInterval(() => {
      shoots.push({
        x: Math.random() * 0.65 + 0.05,
        y: Math.random() * 0.22,
        speed: 0.004 + Math.random() * 0.003,
        len: 0.08 + Math.random() * 0.08,
        life: 1,
        decay: 0.025 + Math.random() * 0.018,
      });
    }, 3000);

    const planes = Array.from({ length: 5 }, (_, i) => ({
      x: -0.1 - i * 0.23,
      y: 0.05 + Math.random() * 0.32,
      speed: 0.0008 + Math.random() * 0.0006,
      size: 9 + Math.random() * 8,
      opacity: 0.18 + Math.random() * 0.22,
      trail: [],
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
      ctx.lineTo(-sz * 0.32, 0);
      ctx.lineTo(-sz * 0.42, -sz * 0.52);
      ctx.lineTo(-sz * 0.1, -sz * 0.52);
      ctx.closePath();
      ctx.fill();
      if (bv) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(sz, 0, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    let animId;
    let t = 0;
    const frame = () => {
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const g1 = ctx.createLinearGradient(0, 0, 0, H);
      g1.addColorStop(0, "#080a14");
      g1.addColorStop(0.4, "#0f1629");
      g1.addColorStop(1, "#1a2a44");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const hor = ctx.createLinearGradient(0, H * 0.5, 0, H);
      hor.addColorStop(0, "rgba(251,191,36,0.05)");
      hor.addColorStop(0.6, "rgba(120,53,15,0.1)");
      hor.addColorStop(1, "rgba(120,53,15,0.18)");
      ctx.fillStyle = hor;
      ctx.fillRect(0, H * 0.5, W, H * 0.5);

      const moonX = W * 0.875,
        moonY = H * 0.065;

      // Outer ambient glow
      const mg1 = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 130);
      mg1.addColorStop(0, "rgba(255,236,120,0.18)");
      mg1.addColorStop(0.4, "rgba(253,200,80,0.08)");
      mg1.addColorStop(1, "rgba(253,180,50,0)");
      ctx.fillStyle = mg1;
      ctx.fillRect(0, 0, W, H * 0.5);

      // Inner bright glow
      const mg2 = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 55);
      mg2.addColorStop(0, "rgba(255,248,180,0.55)");
      mg2.addColorStop(0.3, "rgba(255,220,80,0.25)");
      mg2.addColorStop(1, "rgba(253,200,50,0)");
      ctx.fillStyle = mg2;
      ctx.fillRect(0, 0, W, H * 0.4);

      // Moon disc
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      const discG = ctx.createRadialGradient(moonX - 4, moonY - 4, 2, moonX, moonY, 18);
      discG.addColorStop(0, "rgba(255,252,210,0.98)");
      discG.addColorStop(0.6, "rgba(255,230,100,0.85)");
      discG.addColorStop(1, "rgba(220,180,40,0.5)");
      ctx.fillStyle = discG;
      ctx.shadowColor = "rgba(255,220,80,0.9)";
      ctx.shadowBlur = 28;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crescent shadow
      ctx.beginPath();
      ctx.arc(moonX - 6, moonY - 5, 15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(8,10,22,0.82)";
      ctx.fill();

      t += 0.012;
      stars.forEach((s) => {
        const tw = s.base + Math.sin(t * s.speed + s.phase) * 0.14;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,235,255,${Math.max(0, tw)})`;
        ctx.fill();
      });

      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        const sx = s.x * W,
          sy = s.y * H,
          ex = sx + s.len * W * 0.7,
          ey = sy + s.len * H * 0.35;
        const g2 = ctx.createLinearGradient(sx, sy, ex, ey);
        g2.addColorStop(0, "rgba(200,220,255,0)");
        g2.addColorStop(0.4, `rgba(220,235,255,${s.life * 0.7})`);
        g2.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = g2;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        s.x += s.speed;
        s.y += s.speed * 0.5;
        s.life -= s.decay;
        if (s.life <= 0) shoots.splice(i, 1);
      }

      planes.forEach((p) => {
        const px = p.x * W,
          py = p.y * H;
        p.trail.push({ x: px, y: py });
        if (p.trail.length > 32) p.trail.shift();
        for (let i = 1; i < p.trail.length; i++) {
          const prog = i / p.trail.length;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = `rgba(180,210,240,${prog * p.opacity * 0.45})`;
          ctx.lineWidth = prog * 2.5;
          ctx.stroke();
        }
        drawPlane(px, py, p.size, p.opacity, p.blink);
        p.x += p.speed;
        p.blink += p.blinkSpeed;
        if (p.x > 1.12) {
          p.x = -0.12;
          p.y = 0.05 + Math.random() * 0.32;
          p.trail = [];
        }
      });

      animId = requestAnimationFrame(frame);
    };

    frame();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
      clearInterval(shootInterval);
    };
  }, []);

  const renderTitle = (title, highlight) => {
    if (!highlight) return title;
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: "#38bdf8", fontStyle: "italic", fontWeight: 800 }}>
          {highlight}
        </span>
        {parts[1]}
      </>
    );
  };

  const filledStars = Math.floor(trip.rating);
  const seatsPct = (trip.seatsLeft / trip.seatsTotal) * 100;

  return (
    <div style={styles.card}>
      {/* Background canvas */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Gradient overlay */}
      <div style={styles.overlay} />

      {/* Pyramids SVG silhouette */}
      <div style={styles.pyramidsLayer}>
        <svg
          viewBox="0 0 780 200"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
          style={{ width: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1208" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0d0a04" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="gg" cx="50%" cy="100%" r="60%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
            <filter id="moonGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <ellipse cx="390" cy="200" rx="380" ry="55" fill="url(#gg)" />
          <rect x="0" y="163" width="780" height="37" fill="#0d0a04" />
          <polygon points="560,148 618,163 502,163" fill="url(#pg1)" />
          <polygon points="560,148 589,163 560,163" fill="#1e1508" opacity="0.5" />
          <polygon points="270,102 368,163 172,163" fill="url(#pg1)" />
          <polygon points="270,102 319,163 270,163" fill="#1e1508" opacity="0.4" />
          <polygon points="450,42 618,163 282,163" fill="url(#pg1)" />
          <polygon points="450,42 534,163 450,163" fill="#221a08" opacity="0.45" />
          <g fill="#0d0a04">
            <rect x="150" y="149" width="65" height="14" rx="4" />
            <rect x="174" y="136" width="20" height="14" rx="3" />
            <circle cx="195" cy="132" r="11" />
            <rect x="188" y="129" width="14" height="8" />
          </g>
          <circle cx="680" cy="30" r="18" fill="#fef08a" opacity="0.95" filter="url(#moonGlow)" />
          <circle cx="672" cy="26" r="14" fill="#0d0b18" opacity="0.88" />
        </svg>
      </div>

      {/* ── Hero Image Section ── */}
      <div style={{
        position: 'relative',
        height: 320,
        overflow: 'hidden',
        zIndex: 5,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <img 
          src={trip.image || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=80'} 
          alt={trip.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            animation: 'heroReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        />
        {/* Cinematic Overlays on Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(4,8,15,0.2) 0%, transparent 50%, rgba(4,8,15,0.8) 100%)',
          zIndex: 1,
        }} />
        {/* Golden/Yellowish Glow Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 70% 30%, rgba(251,191,36,0.15) 0%, transparent 60%)',
          mixBlendMode: 'screen',
          zIndex: 2,
        }} />
        
        {/* Title Overlay within Hero */}
        <div style={{
          position: 'absolute',
          bottom: 25,
          left: 26,
          right: 26,
          zIndex: 10,
          animation: 'staggerReveal 0.8s 0.3s ease-out both',
        }}>
          <div style={styles.badge}>
            <span style={styles.pulseDot} />
            {trip.status}
          </div>
          <h2 style={{...styles.title, marginTop: 12, fontSize: 32}}>
            {renderTitle(trip.title, trip.titleHighlight)}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div style={{...styles.content, marginTop: 0}}>
        <div style={{...styles.body, paddingTop: 30}}>
          {/* ── LEFT ── */}
          <div style={styles.left}>
            <div style={{...styles.metaRow, animation: 'staggerReveal 0.8s 0.5s ease-out both'}}>
              <MetaItem icon="pin">{trip.destination}</MetaItem>
              <MetaItem icon="cal">
                {trip.startDate} – {trip.endDate} · {trip.durationDays} Days
              </MetaItem>
              <MetaItem icon="people">{trip.meetingPoint}</MetaItem>
            </div>

            <div style={{animation: 'staggerReveal 0.8s 0.6s ease-out both'}}>
              <p style={styles.priceLabel}>Price per person</p>
              <p style={styles.priceNum}>
                EGP {trip.priceEGP.toLocaleString()}
              </p>
              <p style={styles.priceSub}>
                ≈ USD {trip.priceUSD} · All-inclusive
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    color: i < filledStars ? "#fbbf24" : "#1e2a3a",
                    fontSize: 13,
                  }}
                >
                  ★
                </span>
              ))}
              <span style={styles.rcount}>
                {trip.rating} ({trip.reviewCount} reviews)
              </span>
            </div>

            <div style={styles.diffPill}>⚡ {trip.difficulty}</div>

            <div style={styles.seatsBox}>
              <div style={styles.seatsTop}>
                <span style={{ color: "#c9a95a", fontSize: 11 }}>
                  Available seats
                </span>
                <span style={{ color: "#e2e8f0", fontWeight: 500, fontSize: 11 }}>
                  {trip.seatsLeft} / {trip.seatsTotal} left
                </span>
              </div>
              <div style={styles.track}>
                <div
                  style={{
                    ...styles.fill,
                    width: seatsPct + "%",
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{...styles.right, animation: 'staggerReveal 0.8s 0.55s ease-out both'}}>
            <div>
              <p style={styles.secLabel}>{mode === 'event' ? 'Event details' : 'Trip details'}</p>
              <div style={styles.infoGrid}>
                <InfoCell label="Transport">{trip.details.transport}</InfoCell>
                <InfoCell label="Stay">{trip.details.stay}</InfoCell>
                <InfoCell label="Meals">{trip.details.meals}</InfoCell>
                <InfoCell label="Guide">{trip.details.guide}</InfoCell>
              </div>
            </div>

            <div style={styles.divider} />

            <div>
              <p style={styles.secLabel}>What's included</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {trip.included.map((item, i) => (
                  <div key={i} style={styles.inclRow}>
                    <svg
                      style={{
                        width: 13,
                        height: 13,
                        flexShrink: 0,
                        color: item.yes ? "#34d399" : "#f87171",
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      {item.yes ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </>
                      )}
                    </svg>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.divider} />

            <div style={{animation: 'staggerReveal 0.8s 0.65s ease-out both'}}>
              <p style={styles.secLabel}>What to bring</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {trip.bring.map((t, i) => (
                  <span key={i} style={styles.tag}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{...styles.orgBox, animation: 'staggerReveal 0.8s 0.7s ease-out both'}}>
              <p style={styles.orgName}>{trip.organizer.name}</p>
              <p style={styles.orgContact}>{trip.organizer.contact}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", animation: 'staggerReveal 0.8s 0.8s ease-out both' }}>
              <button style={styles.btnJoin} onClick={onJoin}>
                Join Now →
              </button>
              <button style={styles.btnBack} onClick={onBack}>
                ← {mode === 'event' ? 'Back to Events' : 'Back to Trips'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeup { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroReveal {
          from { transform: scale(1.15); opacity: 0; filter: blur(10px); }
          to { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes staggerReveal {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────────

function MetaItem({ icon, children }) {
  const icons = {
    pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
    cal: "M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM3 10h18",
    people:
      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#c9a95a" }}>
      <svg
        style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.7 }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d={icons[icon]} />
      </svg>
      {children}
    </div>
  );
}

function InfoCell({ label, children }) {
  return (
    <div style={styles.infoCell}>
      <p style={styles.infoCellLbl}>{label}</p>
      <p style={styles.infoCellVal}>{children}</p>
    </div>
  );
}

// ── Styles object ─────────────────────────────────────────────────────
const styles = {
  card: {
    width: "100%",
    maxWidth: 780,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
    animation: "fadeup 0.7s ease-out both",
    fontFamily: "'Inter', sans-serif",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg,rgba(4,8,15,0.05) 0%,rgba(4,8,15,0) 40%,rgba(4,8,15,0.85) 68%,rgba(4,8,15,0.97) 100%)",
    pointerEvents: "none",
  },
  pyramidsLayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: "none",
    zIndex: 2,
  },
  content: {
    position: "relative",
    zIndex: 3,
    minHeight: 520,
    display: "flex",
    flexDirection: "column",
  },
  skySpace: { height: 80 },
  body: {
    padding: "22px 26px 26px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },
  left: { display: "flex", flexDirection: "column", gap: 11 },
  right: { display: "flex", flexDirection: "column", gap: 10 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(56,189,248,0.15)",
    border: "0.5px solid rgba(56,189,248,0.35)",
    color: "#7dd3fc",
    fontSize: 10.5,
    fontWeight: 500,
    padding: "4px 11px",
    borderRadius: 20,
    width: "fit-content",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#38bdf8",
    animation: "blink 1.6s infinite",
    display: "inline-block",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    margin: 0,
  },
  metaRow: { display: "flex", flexDirection: "column", gap: 5 },
  priceLabel: { fontSize: 10, color: "#c9a95a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 },
  priceNum: { fontSize: 28, fontWeight: 700, color: "#38bdf8", lineHeight: 1, margin: 0 },
  priceSub: { fontSize: 11, color: "#c9a95a", marginTop: 2 },
  rcount: { fontSize: 11.5, color: "#c9a95a", marginLeft: 5 },
  diffPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(251,191,36,0.1)",
    border: "0.5px solid rgba(251,191,36,0.25)",
    color: "#fcd34d",
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: 10,
    width: "fit-content",
  },
  seatsBox: {
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  seatsTop: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  track: { height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", background: "linear-gradient(90deg,#0ea5e9,#38bdf8)", borderRadius: 2 },
  secLabel: { fontSize: 10, fontWeight: 500, color: "#c9a95a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 },
  infoCell: { background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "8px 10px" },
  infoCellLbl: { fontSize: 9.5, color: "#c9a95a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 },
  infoCellVal: { fontSize: 12, color: "#cbd5e1", fontWeight: 500, margin: 0 },
  inclRow: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#cbd5e1" },
  tag: { fontSize: 10.5, color: "#c9a95a", background: "rgba(200,170,80,0.08)", border: "0.5px solid rgba(200,170,80,0.18)", padding: "3px 9px", borderRadius: 10 },
  orgBox: { background: "rgba(56,189,248,0.06)", border: "0.5px solid rgba(56,189,248,0.15)", borderRadius: 10, padding: "9px 12px" },
  orgName: { fontSize: 12.5, color: "#7dd3fc", fontWeight: 500, margin: 0 },
  orgContact: { fontSize: 11, color: "#c9a95a", marginTop: 2, marginBottom: 0 },
  divider: { height: 0.5, background: "rgba(255,255,255,0.06)" },
  btnJoin: {
    width: "100%",
    padding: 13,
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  btnBack: {
    width: "100%",
    padding: 10,
    background: "rgba(255,255,255,0.04)",
    color: "#c9a95a",
    border: "0.5px solid rgba(200,170,80,0.2)",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    cursor: "pointer",
  },
};

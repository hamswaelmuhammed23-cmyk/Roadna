import { useEffect, useRef } from 'react';

function cubicIn(t) { return t * t * t; }

const particles = Array.from({ length: 60 }, () => ({
  x: Math.random(), y: Math.random() * 0.8 + 0.1,
  size: Math.random() * 1.8 + 0.4, speed: Math.random() * 0.0002 + 0.00008,
  drift: Math.random() * 0.0001 - 0.00005, op: Math.random() * 0.5 + 0.2,
  phase: Math.random() * Math.PI * 2
}));

const ibisBirds = Array.from({ length: 5 }, (_, i) => ({
  x: 1.1 + i * 0.28, y: 0.15 + Math.sin(i * 1.9) * 0.05,
  speed: 0.000055 + i * 0.000012, wingPhase: Math.random() * Math.PI * 2,
  scale: 0.55 + i * 0.09
}));

function drawShootingStars(ctx, W, H, t) {
  for (let i = 0; i < 6; i++) {
    const period = 3500 + i * 600;
    const phase = (t + i * 1700) % period;
    if (phase > 700) continue;
    const prog = phase / 700;
    const startX = (Math.sin(i * 137.5) * 0.5 + 0.5) * W * 0.85 + W * 0.05;
    const startY = (Math.sin(i * 93.7) * 0.5 + 0.5) * H * 0.28;
    const angle = Math.PI / 5;
    const len = (0.10 + i * 0.015) * W;
    const hx = startX + Math.cos(angle) * len * prog;
    const hy = startY + Math.sin(angle) * len * prog;
    const tx2 = hx - Math.cos(angle) * len * 0.35;
    const ty2 = hy - Math.sin(angle) * len * 0.35;
    const alpha = prog < 0.5 ? prog * 2 : (1 - prog) * 2;
    const grad = ctx.createLinearGradient(tx2, ty2, hx, hy);
    grad.addColorStop(0, 'rgba(240,228,200,0)');
    grad.addColorStop(1, `rgba(255,248,220,${alpha * 0.9})`);
    ctx.beginPath(); ctx.moveTo(tx2, ty2); ctx.lineTo(hx, hy);
    ctx.strokeStyle = grad; ctx.lineWidth = 1.5 + alpha; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, 1.5 * alpha, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,240,${alpha})`; ctx.fill();
  }
}

function drawIbisBirds(ctx, W, H, t) {
  ibisBirds.forEach((bird) => {
    bird.x -= bird.speed * 16;
    if (bird.x < -0.15) { bird.x = 1.1 + Math.random() * 0.3; bird.y = 0.12 + Math.random() * 0.1; }
    const bx = bird.x * W, by = bird.y * H, s = bird.scale;
    const flap = Math.sin(t * 0.003 + bird.wingPhase) * 0.4;
    ctx.save(); ctx.translate(bx, by); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(5,8,18,0.85)';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 5, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -2);
    ctx.quadraticCurveTo(18, -8, 16, -12);
    ctx.quadraticCurveTo(20, -14, 22, -10);
    ctx.quadraticCurveTo(19, -8, 22, 0);
    ctx.quadraticCurveTo(16, 2, 12, -2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(22, -10); ctx.quadraticCurveTo(30, -8, 32, -4);
    ctx.strokeStyle = 'rgba(5,8,18,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(-10, -8 - flap * 15, -22, -2 - flap * 8);
    ctx.quadraticCurveTo(-10, 5, -2, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(-10, 8 + flap * 15, -22, 2 + flap * 8);
    ctx.quadraticCurveTo(-10, -3, -2, 0); ctx.fill();
    ctx.restore();
  });
}

function drawWaterReflection(ctx, W, H, t) {
  const waterY = H * 0.80;
  const wg = ctx.createLinearGradient(0, waterY, 0, H);
  wg.addColorStop(0, 'rgba(4,8,22,0.88)'); wg.addColorStop(1, 'rgba(2,5,12,1)');
  ctx.fillStyle = wg; ctx.fillRect(0, waterY, W, H - waterY);
  for (let r = 0; r < 10; r++) {
    const ry = waterY + (r / 10) * (H - waterY);
    ctx.beginPath(); ctx.moveTo(0, ry);
    for (let x = 0; x <= W; x += 18)
      ctx.lineTo(x, ry + Math.sin(t * 0.0015 + x * 0.022 + r * 1.1) * 2.5);
    ctx.strokeStyle = `rgba(180,160,110,${Math.max(0, 0.045 - r * 0.004)})`; ctx.lineWidth = 0.8; ctx.stroke();
  }
  const mRefX = W * 0.86, mRefY = waterY + (H - waterY) * 0.3;
  const shimmer = 0.5 + 0.5 * Math.sin(t * 0.002);
  const mr = ctx.createRadialGradient(mRefX, mRefY, 0, mRefX, mRefY, W * 0.06);
  mr.addColorStop(0, `rgba(242,232,196,${0.28 * shimmer})`); mr.addColorStop(1, 'rgba(220,200,150,0)');
  ctx.fillStyle = mr; ctx.beginPath(); ctx.ellipse(mRefX, mRefY, W * 0.06, H * 0.02, 0, 0, Math.PI * 2); ctx.fill();
  [0.12, 0.23, 0.34, 0.66, 0.77, 0.88].forEach((colCx, ci) => {
    const colX = W * colCx - W * 0.025;
    const ws = Math.sin(t * 0.001 + ci * 0.9) * 3;
    const rg = ctx.createLinearGradient(0, waterY, 0, H);
    rg.addColorStop(0, 'rgba(112,92,46,0.18)'); rg.addColorStop(1, 'rgba(112,92,46,0)');
    ctx.fillStyle = rg; ctx.beginPath();
    ctx.moveTo(colX + ws, waterY); ctx.lineTo(colX + W * 0.05 + ws, waterY);
    ctx.lineTo(colX + W * 0.05 - ws, H); ctx.lineTo(colX - ws, H); ctx.fill();
  });
}

function drawTypewriter(ctx, W, H, el) {
  if (el < 1.0) return;
  const arabic = 'المتحف المصري الكبير';
  const english = 'THE GRAND EGYPTIAN MUSEUM';
  const prog = Math.min(1, (el - 1.0) / 2.5);
  const alpha = Math.min(1, (el - 1.0) / 0.5);
  const blink = (Math.floor(el * 2) % 2 === 0) && prog < 1;
  const nAr = Math.ceil(arabic.length * prog);
  const shownAr = arabic.substring(arabic.length - nAr);
  const nEn = prog > 0.5 ? Math.ceil(english.length * ((prog - 0.5) * 2)) : 0;
  const shownEn = english.substring(0, nEn);
  ctx.save(); ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(220,195,140,0.7)'; ctx.shadowBlur = 30;
  ctx.fillStyle = `rgba(245,228,182,${0.97 * alpha})`;
  ctx.font = `bold ${H * 0.046}px serif`;
  ctx.fillText(shownAr + (blink ? '|' : ''), W * 0.5, H * 0.84);
  if (nEn > 0) {
    const ea = Math.min(1, (prog - 0.5) * 2);
    ctx.shadowBlur = 14; ctx.font = `${H * 0.021}px serif`;
    ctx.fillStyle = `rgba(210,185,128,${0.84 * alpha * ea})`;
    ctx.fillText(shownEn, W * 0.5, H * 0.9);
  }
  ctx.shadowBlur = 0; ctx.restore();
}

function drawMuseum(ctx, W, H, t, el) {
  ctx.save();
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#020810'); sky.addColorStop(0.5, '#071630'); sky.addColorStop(1, '#0c2040');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 110; i++) {
    const sx = (Math.sin(i * 127.3) * 0.5 + 0.5) * W;
    const sy = (Math.sin(i * 93.7) * 0.5 + 0.5) * H * 0.58;
    const br = 0.5 + 0.5 * Math.sin(t * 0.001 * ((i % 5) + 1) + i);
    ctx.beginPath(); ctx.arc(sx, sy, 0.7 + 0.55 * (i % 3), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,228,200,${0.32 * br + 0.18})`; ctx.fill();
  }

  drawShootingStars(ctx, W, H, t);

  const moonGlow = ctx.createRadialGradient(W * 0.86, H * 0.1, 0, W * 0.86, H * 0.1, H * 0.22);
  moonGlow.addColorStop(0, 'rgba(240,220,155,0.22)'); moonGlow.addColorStop(0.4, 'rgba(240,220,155,0.08)'); moonGlow.addColorStop(1, 'rgba(240,220,155,0)');
  ctx.fillStyle = moonGlow; ctx.fillRect(W * 0.6, 0, W * 0.4, H * 0.4);
  ctx.beginPath(); ctx.arc(W * 0.86, H * 0.1, H * 0.062, 0, Math.PI * 2); ctx.fillStyle = '#f2e8c4'; ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.844, H * 0.087, H * 0.05, 0, Math.PI * 2); ctx.fillStyle = '#020810'; ctx.fill();

  const grd = ctx.createLinearGradient(0, H * 0.67, 0, H);
  grd.addColorStop(0, '#16120a'); grd.addColorStop(1, '#0a0804');
  ctx.fillStyle = grd; ctx.fillRect(0, H * 0.67, W, H * 0.33);

  drawWaterReflection(ctx, W, H, t);

  [0.12, 0.23, 0.34, 0.66, 0.77, 0.88].forEach(cx => {
    const colX = W * cx - W * 0.025;
    const refGrad = ctx.createLinearGradient(0, H * 0.68, 0, H * 0.82);
    refGrad.addColorStop(0, 'rgba(110,88,48,0.18)'); refGrad.addColorStop(1, 'rgba(110,88,48,0)');
    ctx.fillStyle = refGrad; ctx.fillRect(colX, H * 0.68, W * 0.05, H * 0.14);
  });

  const fog = ctx.createLinearGradient(0, H * 0.65, 0, H * 0.82);
  fog.addColorStop(0, 'rgba(180,160,110,0)'); fog.addColorStop(0.3, 'rgba(180,160,110,0.07)');
  fog.addColorStop(0.7, 'rgba(180,160,110,0.12)'); fog.addColorStop(1, 'rgba(180,160,110,0.04)');
  ctx.fillStyle = fog; ctx.fillRect(0, H * 0.65, W, H * 0.2);

  [[H * 0.700, 'rgba(220,195,140,0.3)', 0], [H * 0.686, 'rgba(220,195,140,0.22)', 0.03], [H * 0.672, 'rgba(220,195,140,0.14)', 0.06]].forEach(([y, col, pad]) => {
    ctx.fillStyle = col; ctx.fillRect(W * pad, y, W * (1 - pad * 2), H * 0.016);
  });

  [0.12, 0.23, 0.34, 0.66, 0.77, 0.88].forEach((colCx, ci) => {
    const colX = W * colCx - W * 0.025, colY = H * 0.26, colH = H * 0.42;
    const sweepProg = Math.min(1, Math.max(0, (el - 0.2 - ci * 0.12) / 0.5));
    const cg = ctx.createLinearGradient(colX, 0, colX + W * 0.05, 0);
    cg.addColorStop(0, '#3a2c14'); cg.addColorStop(0.3, '#705c2e'); cg.addColorStop(0.55, '#8a7040'); cg.addColorStop(0.75, '#5e4c28'); cg.addColorStop(1, '#3a2c14');
    ctx.fillStyle = cg; ctx.fillRect(colX, colY, W * 0.05, colH);
    if (sweepProg > 0 && sweepProg < 1) {
      const swY = colY + colH * sweepProg;
      const sg = ctx.createRadialGradient(colX + W * 0.025, swY, 0, colX + W * 0.025, swY, W * 0.05);
      sg.addColorStop(0, `rgba(220,195,140,${0.45 * (1 - Math.abs(sweepProg - 0.5) * 2)})`); sg.addColorStop(1, 'rgba(220,195,140,0)');
      ctx.fillStyle = sg; ctx.fillRect(colX - W * 0.01, colY, W * 0.07, colH);
    }
    ctx.fillStyle = '#7e6a3c';
    ctx.fillRect(colX - W * 0.008, colY - H * 0.022, W * 0.066, H * 0.022);
    ctx.fillRect(colX - W * 0.008, H * 0.677, W * 0.066, H * 0.016);
    ctx.strokeStyle = 'rgba(230,205,148,0.22)'; ctx.lineWidth = 0.8; ctx.strokeRect(colX, colY, W * 0.05, colH);
    for (let r = 0; r < 9; r++) {
      const hp = 0.15 + 0.07 * Math.sin(t * 0.0008 + r * 0.7 + ci);
      ctx.fillStyle = `rgba(220,195,140,${hp})`;
      ctx.fillRect(colX + W * 0.012, colY + H * 0.04 + r * H * 0.04, W * 0.02, H * 0.006);
    }
  });

  ctx.fillStyle = '#504020'; ctx.fillRect(W * 0.10, H * 0.238, W * 0.80, H * 0.026);
  ctx.fillStyle = '#624e28'; ctx.fillRect(W * 0.08, H * 0.213, W * 0.84, H * 0.025);
  ctx.strokeStyle = 'rgba(220,195,140,0.38)'; ctx.lineWidth = 1.2; ctx.strokeRect(W * 0.08, H * 0.213, W * 0.84, H * 0.025);

  const diskPulse = 0.85 + 0.15 * Math.sin(t * 0.0012);
  ctx.fillStyle = '#d4b870'; ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.226, W * 0.042, H * 0.014, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f0dfa0'; ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.226, W * 0.027, H * 0.009, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#020810'; ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.226, W * 0.012, H * 0.006, 0, 0, Math.PI * 2); ctx.fill();
  const dg = ctx.createRadialGradient(W * 0.5, H * 0.226, 0, W * 0.5, H * 0.226, W * 0.08);
  dg.addColorStop(0, `rgba(220,195,140,${0.32 * diskPulse})`); dg.addColorStop(1, 'rgba(220,195,140,0)');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.226, W * 0.08, H * 0.055, 0, 0, Math.PI * 2); ctx.fill();
  [[W * 0.32, W * 0.46], [W * 0.54, W * 0.68]].forEach(([x1, x2]) => {
    ctx.beginPath(); ctx.moveTo(x1, H * 0.226); ctx.quadraticCurveTo((x1 + x2) / 2, H * 0.183, x2, H * 0.226);
    ctx.strokeStyle = 'rgba(220,195,140,0.82)'; ctx.lineWidth = 2.2; ctx.stroke();
    const ex = x1 < W * 0.5 ? x1 - W * 0.02 : x2 + W * 0.02;
    ctx.fillStyle = '#d4b870'; ctx.beginPath(); ctx.ellipse(ex, H * 0.238, W * 0.008, H * 0.018, 0, 0, Math.PI * 2); ctx.fill();
  });

  ctx.fillStyle = '#01030a'; ctx.fillRect(W * 0.425, H * 0.295, W * 0.15, H * 0.385);
  ctx.strokeStyle = 'rgba(220,195,140,0.45)'; ctx.lineWidth = W * 0.005; ctx.strokeRect(W * 0.425, H * 0.295, W * 0.15, H * 0.385);

  const sp = 0.5 + 0.5 * Math.sin(t * 0.0007);
  const spotlight = ctx.createRadialGradient(W * 0.5, H * 0.48, 0, W * 0.5, H * 0.68, W * 0.32);
  spotlight.addColorStop(0, `rgba(220,195,120,${0.22 * sp})`); spotlight.addColorStop(0.4, `rgba(200,170,90,${0.1 * sp})`); spotlight.addColorStop(1, 'rgba(200,170,90,0)');
  ctx.fillStyle = spotlight; ctx.beginPath();
  ctx.moveTo(W * 0.425, H * 0.295); ctx.lineTo(W * 0.575, H * 0.295); ctx.lineTo(W * 0.82, H); ctx.lineTo(W * 0.18, H); ctx.closePath(); ctx.fill();

  [[W * 0.425, W * 0.12], [W * 0.575, W * 0.88]].forEach(([dx, ex]) => {
    const ray = ctx.createLinearGradient(dx, H * 0.35, ex, H * 0.75);
    ray.addColorStop(0, `rgba(220,195,120,${0.06 * sp})`); ray.addColorStop(1, 'rgba(220,195,120,0)');
    ctx.fillStyle = ray; ctx.beginPath(); ctx.moveTo(dx, H * 0.35); ctx.lineTo(ex, H * 0.75); ctx.lineTo(ex + W * 0.05 * (ex > W * 0.5 ? 1 : -1), H * 0.75); ctx.lineTo(dx, H * 0.35); ctx.fill();
  });

  [{ x: W * 0.39, y: H * 0.3 }, { x: W * 0.61, y: H * 0.3 }].forEach((tp, ti) => {
    const fl = 0.78 + 0.22 * Math.sin(t * 0.0045 * (ti + 2) + ti * 1.4);
    const gr = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, W * 0.12);
    gr.addColorStop(0, `rgba(245,215,135,${0.42 * fl})`); gr.addColorStop(0.4, `rgba(210,155,55,${0.22 * fl})`); gr.addColorStop(1, 'rgba(160,90,10,0)');
    ctx.fillStyle = gr; ctx.fillRect(tp.x - W * 0.12, tp.y - H * 0.12, W * 0.24, H * 0.24);
    ctx.fillStyle = '#3c2a10'; ctx.fillRect(tp.x - W * 0.006, tp.y + H * 0.02, W * 0.012, H * 0.05);
    ctx.fillStyle = `rgba(225,${Math.floor(155 + 65 * fl)},65,0.96)`;
    ctx.beginPath(); ctx.moveTo(tp.x - W * 0.014, tp.y + H * 0.02); ctx.lineTo(tp.x, tp.y - H * 0.05 * fl); ctx.lineTo(tp.x + W * 0.014, tp.y + H * 0.02); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(250,238,192,0.94)';
    ctx.beginPath(); ctx.moveTo(tp.x - W * 0.007, tp.y + H * 0.015); ctx.lineTo(tp.x, tp.y - H * 0.034 * fl); ctx.lineTo(tp.x + W * 0.007, tp.y + H * 0.015); ctx.closePath(); ctx.fill();
  });

  for (let i = 0; i < 16; i++) {
    const px = W * 0.04 + i * W * 0.062;
    const ph = H * 0.058 + Math.sin(i * 1.7) * H * 0.018;
    ctx.fillStyle = 'rgba(22,16,6,0.96)';
    ctx.beginPath(); ctx.ellipse(px, H * 0.725, W * 0.014, ph * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(px - W * 0.009, H * 0.725, W * 0.018, H * 0.09);
  }

  drawIbisBirds(ctx, W, H, t);

  particles.forEach(p => {
    p.y -= p.speed * t * 0.01; p.x += p.drift;
    if (p.y < 0.05) p.y = 0.85;
    if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
    const pop = p.op * (0.6 + 0.4 * Math.sin(t * 0.002 + p.phase));
    ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,195,140,${pop * 0.45})`; ctx.fill();
  });

  const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.2, W * 0.5, H * 0.5, W * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.6, 'rgba(0,0,0,0.15)'); vig.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  drawTypewriter(ctx, W, H, el);

  ctx.restore();
}

export default function CinematicOverlay({ onComplete }) {
  const canvasRef = useRef(null);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const start = performance.now(); let animId;

    const frame = (now) => {
      const el = (now - start) / 1000;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (el < 5) {
        drawMuseum(ctx, W, H, now, el);
      } else if (el < 6) {
        const zT = (el - 5), eased = cubicIn(zT), scale = 1 + eased * 10;
        ctx.save();
        ctx.translate(W * 0.5, H * 0.48); ctx.scale(scale, scale); ctx.translate(-W * 0.5, -H * 0.48);
        drawMuseum(ctx, W, H, now, 5);
        ctx.restore();
        ctx.fillStyle = `rgba(2,8,16,${eased * 0.96})`; ctx.fillRect(0, 0, W, H);
      } else if (el < 7) {
        const fadeT = (el - 6);
        canvas.style.opacity = String(1 - fadeT);
        ctx.fillStyle = '#020810'; ctx.fillRect(0, 0, W, H);
      } else {
        cancelAnimationFrame(animId); canvas.style.display = 'none';
        cbRef.current?.(); return;
      }
      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 100000 }} />;
}

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * CinematicReveal — Premium transition that feels like traveling into the trip.
 * 
 * Props:
 *   image: URL of the trip image
 *   title: Title of the trip
 *   rect: Original bounding box of the card image { top, left, width, height }
 *   onComplete: Callback after transition finishes
 */
export default function CinematicReveal({ image, title, rect, onComplete }) {
  const [phase, setPhase] = useState('initializing'); // initializing, zooming, finishing
  const canvasRef = useRef(null);

  // Phase management
  useEffect(() => {
    // Start zooming almost immediately
    const zoomTimer = setTimeout(() => setPhase('zooming'), 50);
    
    // Total duration of the cinematic effect
    const finishTimer = setTimeout(() => {
      setPhase('finishing');
      onComplete?.();
    }, 2200);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  // Particles / Light Streaks Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Create travel particles
    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000 + 500, // Distance
      size: Math.random() * 2 + 1,
      speed: Math.random() * 15 + 10,
    });

    for(let i = 0; i < 60; i++) particles.push(createParticle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      particles.forEach((p, i) => {
        p.z -= p.speed;
        
        if (p.z <= 0) {
          particles[i] = createParticle();
          return;
        }

        // Perspective projection
        const scale = 400 / p.z;
        const px = (p.x - centerX) * scale + centerX;
        const py = (p.y - centerY) * scale + centerY;
        const pSize = p.size * scale;

        // Draw light streak
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - (px - centerX) * 0.1, py - (py - centerY) * 0.1);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, scale * 1.5)})`;
        ctx.lineWidth = pSize;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // If rect is not provided, fallback to standard center zoom
  const startStyle = rect ? {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius: '16px',
  } : {
    top: '50%',
    left: '50%',
    width: '0%',
    height: '0%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
  };

  const isZooming = phase === 'zooming';

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100000,
      backgroundColor: '#000',
      overflow: 'hidden',
      pointerEvents: 'none',
      opacity: phase === 'finishing' ? 0 : 1,
      transition: 'opacity 0.6s ease-in-out',
    }}>
      {/* Background dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0a0f1e',
        opacity: isZooming ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }} />

      {/* The Portal Image (Zooming from card to fullscreen) */}
      <div
        style={{
          position: 'absolute',
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
          boxShadow: '0 0 100px rgba(0,0,0,0.8)',
          ...(isZooming ? {
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 0,
            filter: 'blur(0px) brightness(1.1)',
            transform: 'scale(1.05)',
          } : startStyle),
          transition: 'all 1.8s cubic-bezier(0.22, 1, 0.36, 1)',
          filter: isZooming ? 'blur(0px)' : 'blur(4px)',
        }}
      />

      {/* Cinematic Vignette with golden touch */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, transparent 10%, rgba(251,191,36,0.05) 50%, rgba(0,0,0,0.85) 100%)',
        zIndex: 2,
        opacity: isZooming ? 1 : 0,
        transition: 'opacity 1.2s ease-out',
      }} />

      {/* Particles Overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          mixBlendMode: 'screen',
          opacity: isZooming ? 0.6 : 0,
          transition: 'opacity 1s ease-in',
        }}
      />

      {/* Text Reveal */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 4,
        color: '#fff',
        opacity: isZooming ? 1 : 0,
        transform: isZooming ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.8s 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <p style={{
          fontSize: 14,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 12,
          fontFamily: "'Outfit', sans-serif"
        }}>Preparing your journey</p>
        <h2 style={{
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 900,
          margin: 0,
          fontFamily: "'Outfit', sans-serif",
          textShadow: '0 10px 40px rgba(0,0,0,0.5)',
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h2>
      </div>

      <style>{`
        @font-face {
          font-family: 'Outfit';
          src: url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        }
      `}</style>
    </div>,
    document.body
  );
}

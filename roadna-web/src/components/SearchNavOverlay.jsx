import React, { useEffect, useState } from 'react';

const PARTICLE_EMOJIS = ['⭐', '✨', '🌟', '💫', '🔵', '🟢', '🌀'];

export default function SearchNavOverlay({ label, emoji, targetSectionSelector, onFinished }) {
  const [phase, setPhase] = useState('mount');

  const [particles] = useState(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      ch: PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 1.5,
      fontSize: Math.random() * 16 + 10,
    }));
  });

  useEffect(() => {
    const raf0 = requestAnimationFrame(() => setPhase('active'));
    const tExit = setTimeout(() => setPhase('exit'), 2200);
    const tDone = setTimeout(() => {
      onFinished();
      const el = document.querySelector(targetSectionSelector);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 2700);
    return () => {
      cancelAnimationFrame(raf0);
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, [onFinished, targetSectionSelector]);

  const overlayClass =
    phase === 'mount'
      ? 'search-nav-overlay'
      : phase === 'active'
        ? 'search-nav-overlay active'
        : 'search-nav-overlay active exit';

  return (
    <div className={overlayClass}>
      <div className="sno-content">
        <div className="sno-plane-wrap">
          <div className="sno-plane">✈️</div>
          <div className="sno-trail" />
        </div>
        <div className="sno-emoji">{emoji}</div>
        <p className="sno-going">Taking you to</p>
        <h2 className="sno-label">{label}</h2>
        <p className="sno-sub">Scroll down to explore ↓</p>
        <div className="sno-bar">
          <div className="sno-bar-fill" />
        </div>
      </div>
      <div className="sno-particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="sno-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              fontSize: `${p.fontSize}px`,
            }}
          >
            {p.ch}
          </span>
        ))}
      </div>
    </div>
  );
}

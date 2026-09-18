import React from 'react';

/**
 * Logo component — premium Roadna logo with actual image, clear & bold.
 * Props:
 *   theme: 'light' | 'dark'
 *   size:  'sm' | 'md' | 'lg'
 */
export default function Logo({ theme = 'light', size = 'md' }) {
  const cfg = {
    sm: { imgSize: 38, titleSize: 15, subtitleSize: 8 },
    md: { imgSize: 48, titleSize: 19, subtitleSize: 9 },
    lg: { imgSize: 60, titleSize: 24, subtitleSize: 11 },
  }[size] || { imgSize: 48, titleSize: 19, subtitleSize: 9 };

  const titleColor  = theme === 'dark'  ? '#ffffff' : '#0f172a';
  const subColor    = theme === 'dark'  ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.5)';

  return (
    <div
      className="roadna-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* ── Logo image ── */}
      <div
        className="roadna-logo__ring"
        style={{
          position: 'relative',
          width:  cfg.imgSize,
          height: cfg.imgSize,
          flexShrink: 0,
        }}
      >
        {/* Spinning gradient ring */}
        <div
          className="roadna-logo__spin"
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #4CB8E7 0%, #2563eb 40%, #2F80ED 70%, #4CB8E7 100%)',
            animation: 'logoSpin 2.8s linear infinite',
            zIndex: 0,
          }}
        />
        {/* Inner white circle (creates ring gap) */}
        <div
          style={{
            position: 'absolute',
            inset: 2,
            borderRadius: '50%',
            background: theme === 'dark' ? '#0a1628' : '#ffffff',
            zIndex: 1,
          }}
        />
        {/* Logo image */}
        <img
          src="/images/roadna-logo.png"
          alt="Roadna logo"
          style={{
            position: 'absolute',
            inset: 4,
            width:  `calc(100% - 8px)`,
            height: `calc(100% - 8px)`,
            objectFit: 'contain',
            borderRadius: '50%',
            background: '#ffffff',
            zIndex: 2,
            filter: 'hue-rotate(-15deg) saturate(1.1)',
          }}
          onError={e => {
            e.target.style.display = 'none';
            document.getElementById('roadna-fallback-icon')?.style?.setProperty('display', 'flex');
          }}
        />
        {/* Fallback plane icon (hidden unless img fails) */}
        <div
          id="roadna-fallback-icon"
          style={{
            display: 'none',
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#4CB8E7,#2F80ED)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <svg width={cfg.imgSize * 0.45} height={cfg.imgSize * 0.45} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
        </div>
      </div>

      {/* ── Text ── */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontSize: cfg.titleSize,
            fontWeight: 800,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.02em',
            background: 'linear-gradient(120deg, #4CB8E7 0%, #2F80ED 55%, #1e40af 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Roadna
        </span>
        <span
          style={{
            fontSize: cfg.subtitleSize,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: subColor,
            marginTop: 2,
          }}
        >
          Journeys Connect Us
        </span>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes logoSpin {
          to { transform: rotate(360deg); }
        }
        .roadna-logo:hover .roadna-logo__ring {
          transform: scale(1.1);
        }
        .roadna-logo__ring {
          transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
        }
        .roadna-logo:hover .roadna-logo__spin {
          filter: blur(1.5px) brightness(1.2);
        }
      `}</style>
    </div>
  );
}

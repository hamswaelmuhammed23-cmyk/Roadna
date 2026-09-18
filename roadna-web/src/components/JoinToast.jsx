import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function JoinToast({ name, location, trip, mode = 'trip', onDismiss }) {
  const [visible, setVisible] = useState(false);
  const dismissAfterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let r2;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setVisible(true));
    });
    const t = setTimeout(() => {
      setVisible(false);
      dismissAfterRef.current = setTimeout(onDismiss, 500);
    }, 7000);
    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
      clearTimeout(t);
      if (dismissAfterRef.current) clearTimeout(dismissAfterRef.current);
    };
  }, [name, location, onDismiss]);

  const handleLetsGo = () => {
    onDismiss();
    navigate('/trip-details', { state: { trip, mode } });
  };

  return (
    <div className={`join-toast${visible ? ' visible' : ''}`}>
      <div className="toast-check">✓</div>
      <div className="toast-info">
        <h4>Joined! 🎉</h4>
        <p>{name}</p>
        {location ? <small>{location}</small> : null}
        {trip && (
          <button
            onClick={handleLetsGo}
            style={{
              marginTop: 8,
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #0ea5e9, #6348dd)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Let's Go! 🚀
          </button>
        )}
      </div>
      <div className="toast-countdown">
        <div className="toast-countdown-bar" />
      </div>
    </div>
  );
}

export function CancelToast({ name, location, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const dismissAfterRef = useRef(null);

  useEffect(() => {
    let r2;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setVisible(true));
    });
    const t = setTimeout(() => {
      setVisible(false);
      dismissAfterRef.current = setTimeout(onDismiss, 500);
    }, 7000);
    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
      clearTimeout(t);
      if (dismissAfterRef.current) clearTimeout(dismissAfterRef.current);
    };
  }, [name, location, onDismiss]);

  return (
    <div className={`cancel-toast${visible ? ' visible' : ''}`}>
      <div className="cancel-toast-icon">✕</div>
      <div className="cancel-toast-info">
        <h4>Cancelled ❌</h4>
        <p>{name}</p>
        {location ? <small>{location}</small> : null}
      </div>
      <div className="toast-countdown">
        <div className="toast-countdown-bar" />
      </div>
    </div>
  );
}

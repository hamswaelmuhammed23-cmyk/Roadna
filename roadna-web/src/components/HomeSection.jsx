import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Globe } from 'lucide-react';
import Header from './Header.jsx';
import LiveTravelPulse from './LiveTravelPulse.jsx';

function useAirplaneSmoke() {
  const containerRef = useRef(null);
  const planeRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const plane = planeRef.current;
    if (!container || !plane) return undefined;

    const CROSS_DURATION = 16000;
    const PAUSE_DURATION = 3000;
    const SMOKE_INTERVAL = 110;

    let cancelled = false;
    let startTime = null;
    let lastSmoke = 0;
    let rafId = null;
    let pauseTimer = null;

    function spawnSmoke(px, py) {
      const size = 13 + Math.random() * 22;
      const dur = 2.6 + Math.random() * 1.4;
      const puff = document.createElement('div');
      puff.className = 'smoke-puff';
      const bx = px - 10 - Math.random() * 18;
      const by = py + 14 + Math.random() * 10;
      puff.style.cssText = `
        left: ${bx}px;
        top:  ${by}px;
        width:  ${size}px;
        height: ${size}px;
        animation-duration: ${dur}s;
      `;
      container.appendChild(puff);
      setTimeout(() => puff.remove(), dur * 1000);
    }

    function fly(timestamp) {
      if (cancelled) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / CROSS_DURATION, 1);
      const W = container.offsetWidth || window.innerWidth;
      const H = container.offsetHeight || window.innerHeight;
      
      // Sync with user's CSS expectation
      const planeX = -80 + (W + 160) * t;
      const baseY = H * 0.20; // 20% as per CSS
      const planeY = baseY + Math.sin(t * Math.PI * 4) * 25;
      
      plane.style.left = `${planeX}px`;
      plane.style.top = `${planeY}px`;
      
      const vAngle = Math.cos(t * Math.PI * 4) * 25 * ((Math.PI * 4) / CROSS_DURATION);
      const tilt = Math.max(-12, Math.min(6, vAngle * 4000));
      plane.style.transform = `rotate(${tilt}deg)`;
      
      if (elapsed - lastSmoke >= SMOKE_INTERVAL) {
        spawnSmoke(planeX, planeY);
        if (Math.random() < 0.33) spawnSmoke(planeX - 8, planeY + 5);
        lastSmoke = elapsed;
      }
      if (t < 1) {
        rafId = requestAnimationFrame(fly);
      } else {
        plane.style.opacity = '0';
        pauseTimer = setTimeout(() => {
          if (cancelled) return;
          plane.style.opacity = '1';
          startTime = null;
          lastSmoke = 0;
          rafId = requestAnimationFrame(fly);
        }, PAUSE_DURATION);
      }
    }

    rafId = requestAnimationFrame(fly);
    return () => {
      cancelled = true;
      if (pauseTimer) clearTimeout(pauseTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return { containerRef, planeRef };
}

export default function HomeSection({ menuOpen, onMenuToggle, headerScrolled }) {
  const { containerRef, planeRef } = useAirplaneSmoke();
  const navigate = useNavigate();

  return (
    <section className="home-page" id="page-background">
      <div className="airplane-container" ref={containerRef}>
        <div className="airplane" ref={planeRef}>
          ✈️
        </div>
      </div>

      <Header menuOpen={menuOpen} onMenuToggle={onMenuToggle} headerScrolled={headerScrolled} />

      <div className="container2 flex items-start justify-between">
        <div className="contents flex-1">
          <motion.div 
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="travelers-badge"
          >
            <Sparkles className="badge-icon text-yellow-500 fill-yellow-500/20" size={16} />
            <span className="badge-text ml-2">Join 10,000+ Travelers</span>
          </motion.div>
          
          <div className="home-content">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="home-title2" 
              style={{ lineHeight: '1.05', letterSpacing: '-0.03em' }}
            >
              Find Your Perfect<br />
              <span className="highlight-text">Travel and Events Buddy</span> in Egypt
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="sub-heading" 
              style={{ marginTop: '15px', color: '#64748b', maxWidth: '520px', fontSize: '18px' }}
            >
              Connect, explore and share journeys with like-minded travelers across Egypt.
            </motion.p>
          </div>
          
          <div className="search-section w-full">
            <LiveTravelPulse />
            
            <div className="btns mt-10 flex gap-6">
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -5, boxShadow: '0 25px 50px -12px rgba(47, 128, 237, 0.4)' }}
                whileActive={{ scale: 0.95 }}
                type="button" 
                className="start-btn shadow-2xl px-10 py-4 font-black text-lg bg-gradient-to-r from-[#2F80ED] to-[#1E40AF] text-white rounded-2xl cursor-pointer flex items-center gap-3"
                onClick={() => navigate('/register')}
              >
                <Rocket className="text-white fill-white/20" size={24} />
                <span>Start Your Journey</span>
              </motion.button>
              
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileActive={{ scale: 0.95 }}
                type="button" 
                className="explore-btn shadow-xl px-10 py-4 font-black text-lg rounded-2xl flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/explore')}
              >
                <Globe size={24} />
                <span>Explore Trips</span>
              </motion.button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.5 }}
              className="stats mt-14 flex gap-12 border-t border-slate-100 pt-10"
            >
              <div className="state-box">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">10K+</h2>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[3px] mt-2">Travelers</p>
              </div>
              <div className="state-box">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">500+</h2>
                <p className="text-slate-400 text-[12px] font-black uppercase tracking-[3px] mt-2">Trips</p>
              </div>
              <div className="state-box">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">50+</h2>
                <p className="text-slate-400 text-[12px] font-black uppercase tracking-[3px] mt-2">Cities</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 150 }}
          animate={{ 
            opacity: 1, 
            scale: [1, 1.04, 1],
            y: [140, 110, 140], 
          }}
          transition={{ 
            opacity: { duration: 1.5, delay: 0.8 },
            scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="image relative flex-shrink-0 group"
          style={{ width: '45%', maxWidth: '520px' }}
        >
          <img 
            src={new URL('../assets/hero-travelers.png', import.meta.url).href} 
            alt="Travelers" 
            className="rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] relative z-10 w-full transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </motion.div>
      </div>
    </section>
  );
}

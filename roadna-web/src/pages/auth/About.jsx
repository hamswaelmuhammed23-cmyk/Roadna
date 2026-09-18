import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer.jsx';
import Logo from '../../components/Logo.jsx';
import './About.css';

// ── Images from public/images ──────────────────────────────────────────────
const hamsBack      = '/images/hams-back.jpeg';
const mariemAi     = '/images/mariem-ai.jpeg';
const janaAi       = '/images/jana-ai.jpeg';
const nour         = '/images/nour.jpeg';
const rewanBack    = '/images/rewan-back.jpeg';
const nada4         = '/images/nada4.jpeg';
const shahd3        = '/images/shahd3.jpeg';
const roadnaStory   = '/images/roadna-story.jpeg';
const picnic        = '/images/Picnic.jpg';

// ============================================================
// 🌌 Stars Canvas Component
// ============================================================
function StarsCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let stars = [];
    let shootingStars = [];
    let W, H, animId;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    
    function createStars() {
      stars = [];
      const count = Math.floor((W * H) / 4000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.2,
          alpha: Math.random(),
          speed: Math.random() * 0.008 + 0.003,
          phase: Math.random() * Math.PI * 2,
          color: '200,230,255'
        });
      }
    }

    function createShootingStar() {
      const startX = Math.random() * W * 0.8;
      const startY = Math.random() * H * 0.5;
      shootingStars.push({
        x: startX, y: startY,
        vx: (Math.random() * 6 + 4),
        vy: (Math.random() * 3 + 2),
        len: Math.random() * 120 + 60,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 60 + 40
      });
    }

    const shootInterval = setInterval(createShootingStar, 3500);
    createShootingStar();

    let time = 0;
    function drawStars() {
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
      grad.addColorStop(0, '#020d1a');
      grad.addColorStop(0.5, '#030f22');
      grad.addColorStop(1, '#020d1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      time += 0.016;
      stars.forEach(s => {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${twinkle})`;
        ctx.fill();
      });

      shootingStars = shootingStars.filter(ss => ss.life < ss.maxLife);
      shootingStars.forEach(ss => {
        ss.life++; ss.x += ss.vx; ss.y += ss.vy;
        const progress = ss.life / ss.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        ctx.beginPath();
        ctx.moveTo(ss.x - ss.vx * (ss.len / 8), ss.y - ss.vy * (ss.len / 8));
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      animId = requestAnimationFrame(drawStars);
    }

    createStars();
    drawStars();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shootInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="starsCanvas" />;
}

// ============================================================
// 🧭 Header Component (Synced with Contact Page)
// ============================================================
function AboutHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled]  = useState(false);
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  });

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`main-nav${navScrolled ? ' scrolled' : ''}`} id="mainNav">
      <Link to="/" className="nav-logo">
        <Logo />
      </Link>
      
      <ul className={`nav-links${mobileMenuOpen ? ' open' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/explore">Explore</Link></li>
        <li><Link to="/chat">Chat</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        <li><Link to="/about" className="active">About Us</Link></li>
        {!user ? (
          <li className="home-login"><Link to="/login">Login</Link></li>
        ) : (
          <li className="nav-profile-link" style={{ marginLeft: '10px' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '35px', 
                height: '35px', 
                borderRadius: '50%', 
                overflow: 'hidden', 
                background: '#2F80ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                {user.photo ? (
                  <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '14px', color: '#fff' }}>👤</span>
                )}
              </div>
            </Link>
          </li>
        )}
      </ul>

      <button 
        type="button" 
        className={`mobile-toggle${mobileMenuOpen ? ' active' : ''}`} 
        onClick={() => setMobileMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}

// ============================================================
// App — About Component
// ============================================================
export default function About() {
  useEffect(() => {
    // Scroll animation logic
    const options = { threshold: 0.1, rootMargin: '0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page-root">
      <StarsCanvas />

      {/* ✈️ Flying Airplane Animation */}
      <div className="airplane-wrap">
        <svg className="plane-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.8 19.2L16 11L19.5 7.5C21 6 21.5 4 21 3C20 2.5 18 3 16.5 4.5L13 8L4.8 6.2C4.3 6.1 3.9 6.3 3.7 6.7L3.4 7.2C3.2 7.7 3.3 8.2 3.7 8.5L9 12L7 15H4L3 16L6 18L8 21L9 20V17L12 15L15.5 20.3C15.8 20.7 16.3 20.8 16.8 20.6L17.3 20.4C17.7 20.1 17.9 19.7 17.8 19.2Z" fill="white"/>
        </svg>
        <div className="plane-trail"></div>
      </div>
      
      <AboutHeader />

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">ABOUT Roadna</h1>
          <p className="hero-subtitle">We believe travel should be a unique and personal experience for every explorer</p>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card glass-card fade-in">
              <div className="stat-number">50K+</div>
              <p className="stat-label">Active Travelers</p>
            </div>
            <div className="stat-card glass-card fade-in">
              <div className="stat-number">10K+</div>
              <p className="stat-label">Planned Trips</p>
            </div>
            <div className="stat-card glass-card fade-in">
              <div className="stat-number">150+</div>
              <p className="stat-label">Destinations</p>
            </div>
            <div className="stat-card glass-card fade-in">
              <div className="stat-number">4.8★</div>
              <p className="stat-label">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story">
        <div className="container">
          <div className="story-grid">
            <div className="story-content fade-in-left">
              <h2>Our Story</h2>
              <p>Roadna began as a simple idea: to help people discover the world more easily and enjoyably. In 2026, a group of travel enthusiasts and tech innovators came together to create a platform that connects travelers with authentic and unique experiences.</p>
              <p>Today, we're proud to have become the first choice for millions of travelers worldwide who are looking for unforgettable travel experiences. Our mission is to make every journey personal, meaningful, and memorable.</p>
            </div>
            <div className="story-image fade-in-right">
              <img src={roadnaStory} alt="Roadna Story" />
            </div>
          </div>
        </div>
      </section>

      <section className="mission">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-image fade-in-left">
              <img src={picnic} alt="Our Mission" />
            </div>
            <div className="mission-content fade-in-right">
              <h2>Our Mission</h2>
              <p>Our mission is to empower travelers to explore the world authentically. We believe that travel is more than just visiting places—it's about connecting with cultures, meeting new people, and creating memories that last a lifetime.</p>
              <p>Through Roadna, we're building a community where travelers can share experiences, discover hidden gems, and support local communities around the world.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="values">
        <div className="container">
          <h2 className="section-title">Core Values</h2>
          <div className="values-grid">
            <div className="value-card glass-card fade-in">
              <div className="value-icon">🌍</div>
              <h3>Exploration</h3>
              <p>We encourage curiosity and the desire to discover new places, cultures, and perspectives.</p>
            </div>
            <div className="value-card glass-card fade-in">
              <div className="value-icon">👥</div>
              <h3>Community</h3>
              <p>We believe in the power of community and creating meaningful connections between travelers.</p>
            </div>
            <div className="value-card glass-card fade-in">
              <div className="value-icon">💡</div>
              <h3>Innovation</h3>
              <p>We continuously innovate to make travel planning easier and more enjoyable for everyone.</p>
            </div>
            <div className="value-card glass-card fade-in">
              <div className="value-icon">🌱</div>
              <h3>Sustainability</h3>
              <p>We are committed to promoting responsible travel that respects the environment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="team">
        <div className="container">
          <div className="team-diamond fade-in">
            {/* Move title to top for better mobile order */}
            <div className="team-center-title td-center">
              <h2>Meet OUR Team</h2>
              <div className="team-center-orbit"></div>
              <p>The minds behind every journey</p>
            </div>

            {/* Team Members mapped to positions */}
            {[
              { pos: 'td-pos1', img: hamsBack, name: 'Hams Wael', role: 'BackEnd-Developer' },
              { pos: 'td-pos2', img: mariemAi, name: 'Maryam Tariq', role: 'Ai-Developer' },
              { pos: 'td-pos3', img: janaAi, name: 'Jana Ayman', role: 'Ai-Developer' },
              { pos: 'td-pos4', img: nour, name: 'Nour Moustafa', role: 'Ai-Developer' },
              { pos: 'td-pos5', img: rewanBack, name: 'Rowan Mamdouh', role: 'BackEnd-Developer' },
              { pos: 'td-pos6', img: nada4, name: 'Nada Atef', role: 'FrontEnd-Developer' },
              { pos: 'td-pos7', img: shahd3, name: 'Shahd Wael', role: 'FrontEnd-Developer' }
            ].map((m, i) => (
              <div key={i} className={`team-member glass-card ${m.pos}`}>
                <div className="team-member-img-wrap">
                  <img src={m.img} alt={m.name} />
                </div>
                <h3>{m.name}</h3>
                <p className="team-role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

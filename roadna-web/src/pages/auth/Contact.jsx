import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Contact.css'

/**
 * Contact.jsx
 * A premium Contact Us page with glassmorphism, animations, and a success modal.
 */

export default function Contact() {
  const heroParticlesRef = useRef(null)
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [successModalShow, setSuccessModalShow] = useState(false)
  const [successParticles, setSuccessParticles] = useState([])

  const showToast = useCallback((msg) => {
    let toast = document.getElementById('globalToast')
    if (!toast) {
      toast = document.createElement('div')
      toast.className = 'toast'
      toast.id = 'globalToast'
      toast.innerHTML = '<span class="toast-icon">⚠️</span><span class="toast-text"></span>'
      document.body.appendChild(toast)
    }
    toast.querySelector('.toast-text').textContent = msg
    toast.classList.add('show')
    clearTimeout(toast._timer)
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500)
  }, [])

  const closeSuccessModal = useCallback(() => {
    setSuccessModalShow(false)
    document.body.style.overflow = ''
  }, [])

  const showSuccessModalFn = useCallback(() => {
    const particles = []
    for (let i = 0; i < 22; i++) {
      particles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${4 + Math.random() * 6}px`,
        height: `${4 + Math.random() * 6}px`,
        background: ['#00d4ff', '#f0c040', '#a78bfa', '#00b894', '#f472b6'][Math.floor(Math.random() * 5)],
        animationDelay: `${Math.random() * 0.8}s`,
        animationDuration: `${1.5 + Math.random() * 1.5}s`,
      })
    }
    setSuccessParticles(particles)
    setSuccessModalShow(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const handleSubmit = useCallback(
    (btn) => {
      const fields = [
        document.getElementById('firstName'),
        document.getElementById('lastName'),
        document.getElementById('email'),
        document.getElementById('phone'),
        document.getElementById('service'),
        document.getElementById('date'),
        document.getElementById('message'),
      ]

      fields.forEach((f) => f?.classList.remove('input-error'))

      let hasError = false
      fields.forEach((f) => {
        if (!f || !String(f.value).trim()) {
          if (f) {
            f.classList.add('input-error')
            hasError = true
            setTimeout(() => f.classList.remove('input-error'), 1500)
          }
        }
      })

      if (hasError) {
        showToast('Please fill in all fields before sending your request ✦')
        const firstError = document.querySelector('.input-error')
        if (firstError) firstError.focus()
        return
      }

      const btnText = btn.querySelector('.btn-text')
      const original = btnText.innerHTML
      btnText.innerHTML = '✓ Message Sent!'
      btn.style.background = 'linear-gradient(135deg, #00b894, #00cec9)'
      btn.disabled = true
      btn.classList.add('sent')

      setTimeout(() => {
        showSuccessModalFn()
        fields.forEach((f) => {
          if (f) {
            f.value = ''
            f.blur()
          }
        })
        btnText.innerHTML = original
        btn.style.background = ''
        btn.disabled = false
        btn.classList.remove('sent')
      }, 800)
    },
    [showSuccessModalFn, showToast],
  )

  const [user] = useState(() => {
    const stored = localStorage.getItem('userProfile')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    // If we need to sync with other tabs or something, we can keep an effect here
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 50)
      const hero = document.querySelector('.sec1')
      if (hero) {
        const scroll = window.scrollY
        hero.style.setProperty('--parallax', scroll * 0.4 + 'px')
      }
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const container = heroParticlesRef.current
    if (!container) return
    container.innerHTML = ''
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      p.style.left = Math.random() * 100 + '%'
      p.style.top = Math.random() * 100 + '%'
      p.style.animationDelay = Math.random() * 6 + 's'
      p.style.animationDuration = 3 + Math.random() * 4 + 's'
      p.style.width = p.style.height = 2 + Math.random() * 3 + 'px'
      container.appendChild(p)
    }
  }, [])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    document.querySelectorAll('[data-anim]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.querySelectorAll('.glass-card').forEach((card) => {
      const onMove = (e) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const cx = rect.width / 2
        const cy = rect.height / 2
        const rotX = ((y - cy) / cy) * -5
        const rotY = ((x - cx) / cx) * 5
        card.style.transform = `translateY(-8px) scale(1.02) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
        const glow = card.querySelector('.card-glow')
        if (glow) {
          glow.style.left = x + 'px'
          glow.style.top = y + 'px'
          glow.style.opacity = '1'
        }
      }
      const onLeave = () => {
        card.style.transform = ''
        const glow = card.querySelector('.card-glow')
        if (glow) glow.style.opacity = '0'
      }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
    })
  }, [])

  useEffect(() => {
    const onAnchorClick = (e) => {
      const anchor = e.target.closest && e.target.closest('a[href^="#"]')
      if (!anchor) return
      e.preventDefault()
      const href = anchor.getAttribute('href')
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('click', onAnchorClick)
    return () => document.removeEventListener('click', onAnchorClick)
  }, [])

  return (
    <div className="contact-page-root">
      <section className="sec1" id="hero">
        <div className="hero-particles" id="heroParticles" ref={heroParticlesRef} />

        <div className="hero-overlay" />

        <nav className={`main-nav${navScrolled ? ' scrolled' : ''}`} id="mainNav">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">✦</span> ROADNA
          </Link>
          <ul className={`nav-links${mobileMenuOpen ? ' open' : ''}`}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/explore">Explore</Link>
            </li>
            <li>
              <Link to="/chat">Messages</Link>
            </li>
            <li>
              <Link to="/contact" className="active">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            {!user ? (
              <li className="home-login">
                <Link to="/login">Login</Link>
              </li>
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
            id="mobileToggle"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-line-1">Contact</span>
            <span className="hero-line-2">Roadna</span>
          </h1>
          <div className="hero-divider">
            <span className="divider-line" />
            <span className="divider-icon">✦</span>
            <span className="divider-line" />
          </div>
          <p className="hero-subtitle">We&apos;re here to turn your travel dreams into unforgettable experiences</p>
          <a href="#contact" className="hero-cta">
            <span>Get In Touch</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>

        <div className="hero-scroll">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span className="scroll-text">SCROLL</span>
        </div>
      </section>

      <section className="sec-contact" id="contact">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="geo-shape geo-1" />
        <div className="geo-shape geo-2" />
        <div className="geo-shape geo-3" />

        <div className="contact-header" data-anim="fade-up">
          <p className="contact-eyebrow">✦ Get In Touch</p>
          <h2 className="contact-title">
            We&apos;d Love to Hear
            <br />
            From You
          </h2>
          <p className="contact-subtitle">
            Whether you&apos;re planning your next adventure or organizing an unforgettable event — we&apos;re here to make it
            happen.
          </p>
        </div>

        <div className="cards-grid">
          <div className="glass-card" data-anim="fade-up">
            <div className="card-particles">
              <div className="card-dot" />
              <div className="card-dot" />
              <div className="card-dot" />
            </div>
            <div className="card-glow" />
            <div className="card-icon-bg">
              <div className="card-icon">✈️</div>
            </div>
            <p className="card-label">Travel</p>
            <h3 className="card-title">Plan Your Journey</h3>
            <p className="card-desc">
              Book flights, hotels, and personalized travel packages tailored to your dream destination.
            </p>
            <a href="#" className="card-action">
              Explore Trips
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="glass-card" data-anim="fade-up">
            <div className="card-particles">
              <div className="card-dot" />
              <div className="card-dot" />
              <div className="card-dot" />
            </div>
            <div className="card-glow" />
            <div className="card-icon-bg">
              <div className="card-icon">🎉</div>
            </div>
            <p className="card-label">Events</p>
            <h3 className="card-title">Create Memories</h3>
            <p className="card-desc">From weddings to corporate events — we design experiences that leave a lasting impression.</p>
            <a href="#" className="card-action">
              View Events
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="glass-card" data-anim="fade-up">
            <div className="card-particles">
              <div className="card-dot" />
              <div className="card-dot" />
              <div className="card-dot" />
            </div>
            <div className="card-glow" />
            <div className="card-icon-bg">
              <div className="card-icon">💬</div>
            </div>
            <p className="card-label">Support</p>
            <h3 className="card-title">24/7 Assistance</h3>
            <p className="card-desc">Our dedicated team is always ready to help with any questions or changes to your plans.</p>
            <a href="#" className="card-action">
              Chat Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="glass-card card-wide" data-anim="fade-up">
            <div className="wide-left">
              <div className="card-icon-bg">
                <div className="card-icon">🌍</div>
              </div>
              <p className="card-label">What We Offer</p>
              <h3 className="card-title">Travel &amp; Events, Reimagined for You</h3>
              <p className="card-desc">
                Roadna combines expert travel planning with seamless event management — all in one place. Tell us your vision,
                we&apos;ll bring it to life.
              </p>
              <a href="#" className="card-action" style={{ marginTop: 28 }}>
                Learn More
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="wide-features">
              <div className="feature-row">
                <span className="feature-icon">🗺️</span>
                <div className="feature-text">
                  <strong>Custom Itineraries</strong>
                  Tailored travel routes &amp; schedules just for you
                </div>
              </div>
              <div className="feature-row">
                <span className="feature-icon">🎭</span>
                <div className="feature-text">
                  <strong>Event Management</strong>
                  Full-service planning from concept to execution
                </div>
              </div>
              <div className="feature-row">
                <span className="feature-icon">🏨</span>
                <div className="feature-text">
                  <strong>Premium Stays</strong>
                  Curated hotels, villas &amp; unique accommodations
                </div>
              </div>
              <div className="feature-row">
                <span className="feature-icon">🔒</span>
                <div className="feature-text">
                  <strong>Secure Booking</strong>
                  Trusted payments &amp; transparent pricing
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section" data-anim="fade-up">
          <div className="side-orbit side-orbit-left">
            <div className="side-orbit-ring s-ring-1">
              <div className="s-dot sd-1" />
            </div>
            <div className="side-orbit-ring s-ring-2">
              <div className="s-dot sd-2" />
            </div>
            <div className="side-orbit-ring s-ring-3">
              <div className="s-dot sd-3" />
            </div>
            <div className="side-orbit-core">
              <div className="side-orbit-inner-glow" />
            </div>
          </div>

          <div className="form-glass">
            <div className="form-header-area">
              <div className="orbit-wrapper">
                <div className="orbit-ring orbit-ring-1">
                  <div className="orbit-dot dot-1" />
                </div>
                <div className="orbit-ring orbit-ring-2">
                  <div className="orbit-dot dot-2" />
                </div>
                <div className="orbit-ring orbit-ring-3">
                  <div className="orbit-dot dot-3" />
                </div>
                <div className="form-icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
              </div>
              <h3 className="form-title">Send Us a Message</h3>
              <p className="form-subtitle">Fill in the form below and our team will get back to you within 24 hours.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" type="text" placeholder="Ahmed" id="firstName" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" type="text" placeholder="Mohamed" id="lastName" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="hello@example.com" id="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" placeholder="+20 100 000 0000" id="phone" />
              </div>
              <div className="form-group">
                <label className="form-label">I&apos;m Interested In</label>
                <select className="form-select" id="service" defaultValue="">
                  <option value="">Select a service...</option>
                  <option>✈️ Travel Planning</option>
                  <option>🎉 Event Management</option>
                  <option>🏨 Join A Trip</option>
                  <option>🎭 Corporate Events</option>
                  <option>💬 General Inquiry</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input className="form-input" type="date" id="date" />
              </div>
              <div className="form-group full">
                <label className="form-label">Tell Us About Your Vision</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your dream trip or event — the more details, the better we can help..."
                  id="message"
                />
              </div>
            </div>

            <button type="button" className="submit-btn" id="submitBtn" onClick={(e) => handleSubmit(e.currentTarget)}>
              <span className="btn-text">✦ Send My Request</span>
              <span className="btn-loader" />
            </button>
            <p className="form-error-msg" id="formErrorMsg" />
          </div>
        </div>

        <div className="info-cards-grid" data-anim="fade-up">
          <div className="glass-card info-glass-card" data-anim="fade-up">
            <div className="card-particles">
              <div className="card-dot" />
              <div className="card-dot" />
              <div className="card-dot" />
            </div>
            <div className="card-glow" />
            <div className="card-icon-bg">
              <div className="card-icon">📍</div>
            </div>
            <p className="card-label">Location</p>
            <h3 className="card-title">Cairo, Egypt</h3>
            <p className="card-desc">Nasr City, Business Hub — Our main headquarters where your journey begins.</p>
            <a href="#" className="card-action">
              Get Directions
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="glass-card info-glass-card" data-anim="fade-up">
            <div className="card-particles">
              <div className="card-dot" />
              <div className="card-dot" />
              <div className="card-dot" />
            </div>
            <div className="card-glow" />
            <div className="card-icon-bg">
              <div className="card-icon">📞</div>
            </div>
            <p className="card-label">Phone</p>
            <h3 className="card-title">+20 100 000 0000</h3>
            <p className="card-desc">Available Sat–Thu, 9am–6pm. Call us anytime during business hours.</p>
            <a href="tel:+201000000000" className="card-action">
              Call Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="glass-card info-glass-card" data-anim="fade-up">
            <div className="card-particles">
              <div className="card-dot" />
              <div className="card-dot" />
              <div className="card-dot" />
            </div>
            <div className="card-glow" />
            <div className="card-icon-bg">
              <div className="card-icon">✉️</div>
            </div>
            <p className="card-label">Email</p>
            <h3 className="card-title">hello@roadna.com</h3>
            <p className="card-desc">Drop us a message — we reply within 24 hours, guaranteed.</p>
            <a href="mailto:hello@roadna.com" className="card-action">
              Send Email
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="col">
              <div className="left-head">
                <div className="footer-plane-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                  </svg>
                </div>
                <h2 className="footer-headline">ROADNA</h2>
              </div>

              <p>Discover Egypt with the perfect travel companions</p>
            </div>

            <div className="col">
              <h4>Quick Links</h4>
              <ul>
                <li>About Us</li>
                <li>How It Works</li>
                <li>FAQ</li>
                <li>Contact</li>
              </ul>
            </div>

            <div className="col">
              <h4>Destinations</h4>
              <ul>
                <li>Cairo</li>
                <li>Luxor</li>
                <li>Aswan</li>
                <li>Sharm El Sheikh</li>
              </ul>
            </div>

            <div className="col">
              <h4>Follow Us</h4>
              <div className="socials">
                <span>
                  <i className="fa-brands fa-facebook-f" />
                </span>
                <span>
                  <i className="fa-brands fa-instagram" />
                </span>
                <span>
                  <i className="fa-brands fa-twitter" />
                </span>
                <span>
                  <i className="fa-solid fa-envelope" />
                </span>
              </div>
            </div>
          </div>

          <div className="bottom">© 2025 Roadna. All rights reserved.</div>
        </div>
      </footer>

      <div
        className={`success-modal-overlay${successModalShow ? ' show' : ''}`}
        id="successModal"
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSuccessModal()
        }}
      >
        <div className="success-modal">
          <div className="success-particles">
            {successParticles.map((p, i) => (
              <div
                key={i}
                className="success-particle"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.width,
                  height: p.height,
                  background: p.background,
                  animationDelay: p.animationDelay,
                  animationDuration: p.animationDuration,
                }}
              />
            ))}
          </div>

          <div className="success-icon-wrap">
            <div className="success-orbit-ring ring-a" />
            <div className="success-orbit-ring ring-b" />
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="check-circle" cx="26" cy="26" r="24" stroke="#00d4ff" strokeWidth="2" />
                <path
                  className="check-tick"
                  d="M14 26l9 9 15-16"
                  stroke="#00d4ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <p className="success-eyebrow">✦ Message Received</p>
          <h2 className="success-title">
            We&apos;ll Be In Touch
            <br />
            Very Soon!
          </h2>
          <p className="success-body">
            شكراً لتواصلك مع Roadna ✨
            <br />
            فريقنا هيرد عليك خلال <strong>24 ساعة</strong> ونبدأ نخطط رحلتك المثالية.
          </p>

          <div className="success-divider">
            <span />
            <span className="success-star">✦</span>
            <span />
          </div>

          <div className="success-badges">
            <div className="success-badge">
              <span>⚡</span> Fast Response
            </div>
            <div className="success-badge">
              <span>🌍</span> Expert Team
            </div>
            <div className="success-badge">
              <span>🔒</span> Secure
            </div>
          </div>

          <button type="button" className="success-close-btn" onClick={closeSuccessModal}>
            <span>Got it, thanks!</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

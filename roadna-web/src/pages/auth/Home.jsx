import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeSection from '../../components/HomeSection';
import DiscoverSection from '../../components/DiscoverSection';
import TripsSection from '../../components/TripsSection';
import EventsSection from '../../components/EventsSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import Footer from '../../components/Footer';
import SearchNavOverlay from '../../components/SearchNavOverlay';
import { JoinToast, CancelToast } from '../../components/JoinToast';
import { findDestination } from '../../utils/searchNav';

// Import our new landing styles
import '../../style.css';

/**
 * Home.jsx — The main landing page.
 */
export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [joinToast, setJoinToast] = useState(null);
  const [cancelToast, setCancelToast] = useState(null);
  const [searchOverlay, setSearchOverlay] = useState(null);

  // Navigation and scrolling states

  // Handle header scroll effect
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal on scroll logic
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return undefined;
    function revealOnScroll() {
      const windowHeight = window.innerHeight;
      revealElements.forEach((el) => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) el.classList.add('active');
      });
    }
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  const showJoinToast = useCallback((name, location, trip, mode = 'trip') => {
    setCancelToast(null);
    setJoinToast({ name, location, trip, mode });
  }, []);

  const showCancelToast = useCallback((name, location) => {
    setJoinToast(null);
    setCancelToast({ name, location });
  }, []);

  const dismissJoinToast = useCallback(() => setJoinToast(null), []);
  const dismissCancelToast = useCallback(() => setCancelToast(null), []);

  const handleSearch = useCallback((query) => {
    const dest = findDestination(query);
    const label = dest ? dest.label : query;
    const emoji = dest ? dest.emoji : '✈️';
    const targetSectionSelector = dest ? dest.section : '.sec2';
    setSearchOverlay({ label, emoji, targetSectionSelector, key: Date.now() });
  }, []);

  const clearSearchOverlay = useCallback(() => setSearchOverlay(null), []);

  return (
    <div className="landing-page-root">
      <HomeSection
        onSearch={handleSearch}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((o) => !o)}
        headerScrolled={headerScrolled}
      />
      <DiscoverSection />
      <TripsSection onJoinToast={showJoinToast} onCancelToast={showCancelToast} />
      <EventsSection onJoinToast={showJoinToast} onCancelToast={showCancelToast} />
      <TestimonialsSection />
      <Footer />

      {searchOverlay ? (
        <SearchNavOverlay
          key={searchOverlay.key}
          label={searchOverlay.label}
          emoji={searchOverlay.emoji}
          targetSectionSelector={searchOverlay.targetSectionSelector}
          onFinished={clearSearchOverlay}
        />
      ) : null}

      {joinToast ? (
        <JoinToast
          key={`j-${joinToast.name}`}
          name={joinToast.name}
          location={joinToast.location}
          trip={joinToast.trip}
          mode={joinToast.mode}
          onDismiss={dismissJoinToast}
        />
      ) : null}
      {cancelToast ? (
        <CancelToast
          key={`c-${cancelToast.name}`}
          name={cancelToast.name}
          location={cancelToast.location}
          onDismiss={dismissCancelToast}
        />
      ) : null}
    </div>
  );
}

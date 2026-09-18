import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { applyPeopleDelta, formatPeopleBadge } from '../utils/peopleCount.js';
import { useNavigate } from 'react-router-dom';
//import { eventDetailsMap } from '../data/tripDetailsData';


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

//import { mockHomeEvents as EVENTS } from '../data/mockData';


function triggerPeoplePop(el) {
  if (!el) return;
  el.classList.remove('updated');
  void el.offsetWidth;
  el.classList.add('updated');
}

export default function EventsSection({ onJoinToast, onCancelToast }) {
  const [joined, setJoined] = useState({});
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState({});
  const joinedRef = useRef(joined);
  const navigate = useNavigate();
  useEffect(() => {
    joinedRef.current = joined;
  }, [joined]);
  useEffect(() => {
    fetch('/api/v1/ai/items')
      .then(r => r.json())
      .then(data => {
        if (!data.success) return
        const all = data.items || []
        const eventItems = all.filter(i => String(i.Classification).toLowerCase() === 'event')
        const picked = eventItems.slice(0, 6)
        const normalized = picked.map((item) => {
          const id = String(item.ID || item.id)
          return {
            id,
            rawId: id,
            title: item.Name || 'Unnamed Event',
            text: item.Description || '',
            tag: item.Category || item.Tags?.split(',')[0]?.trim() || 'Event',
            image: item.Image || `https://picsum.photos/seed/${id}/800/600`,
          }
        })
        const peopleMap = {}
        normalized.forEach(e => { peopleMap[e.id] = { current: 3, max: 10 } })
        setEvents(normalized)
        setPeople(peopleMap)
      })
      .catch(err => console.error('Failed to load events:', err))
  }, [])
  const handleToggle = useCallback(
    (ev) => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) {
        navigate('/login')
        return
      }
      const willJoin = !joinedRef.current[ev.id];
      setJoined((p) => ({ ...p, [ev.id]: willJoin }));
      setPeople((p) => {
        const { current, max } = p[ev.id];
        return {
          ...p,
          [ev.id]: {
            current: applyPeopleDelta(current, max, willJoin ? 1 : -1),
            max,
          },
        };
      });
      setTimeout(() => {
        const el = document.querySelector(`[data-event-people="${ev.id}"]`);
        triggerPeoplePop(el);
      }, 0);
       
      if (willJoin) {
        if (token) {
          fetch('/api/v1/profile/join-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ eventId: ev.rawId || ev.id }),
          }).catch(err => console.error('join-event failed:', err))
        }
        const stored = JSON.parse(localStorage.getItem('joinedEvents') || '[]')
        if (!stored.find(e => String(e.id || e.ID) === String(ev.rawId || ev.id))) {
          stored.push({ ...ev, joinedAt: new Date().toISOString(), mode: 'event' })
          localStorage.setItem('joinedEvents', JSON.stringify(stored))
        }
        onJoinToast?.(ev.title, 'Event', null, 'event')
      } else {
        if (token) {
          fetch('/api/v1/profile/leave-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ eventId: ev.rawId || ev.id }),
          }).catch(err => console.error('leave-event failed:', err))
        }
        const stored = JSON.parse(localStorage.getItem('joinedEvents') || '[]')
        localStorage.setItem('joinedEvents', JSON.stringify(
          stored.filter(e => String(e.id || e.ID) !== String(ev.rawId || ev.id))
        ))
        onCancelToast?.(ev.title, 'Event')
      }
    },
    [onJoinToast, onCancelToast]
  );

  return (
    <section className="sec4 reveal">
      <div className="heading2">
        <h2 className="main-sec2title">Join an Upcoming EVENT <span className="emoji-icon">🎫</span> </h2>
        <p className="sec2-subtitle">Expand your horizons — connect, learn, and grow with our curated events</p>
      </div>
      <div className="events-wrapper">
        <Swiper
          className="eventsSwiper"
          modules={[Pagination, Navigation]}
          slidesPerView={3}
          spaceBetween={20}
          loop
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {events.map((ev) => {
            const isJoined = !!joined[ev.id];
            const { current, max } = people[ev.id];
            return (
              <SwiperSlide key={ev.id} className="card">
                <div className="card-image">
                  <img src={ev.image} alt={ev.title} />
                  <div className="card-tag">{ev.tag}</div>
                  <span className="event-people" data-event-people={ev.id}>
                    {formatPeopleBadge(current, max)}
                  </span>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{ev.title}</h3>
                  <p className="card-text">{ev.text}</p>
                  <a
                    href="#"
                    className={`card-button${isJoined ? ' btn-cancel-state' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggle(ev);
                    }}
                  >
                    {isJoined ? '❌ Cancel' : 'View Event'}
                  </a>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

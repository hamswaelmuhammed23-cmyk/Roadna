import React, { useCallback, useRef, useState, useEffect } from 'react';
import { applyPeopleDelta, formatPeopleBadge, parsePeopleBadge } from '../utils/peopleCount.js';
import { tripDetailsMap } from '../data/tripDetailsData';
import { useNavigate } from 'react-router-dom';

const MOCK_HOSTS = [
  { avatar: '/images/user1.jpg', name: 'Tala', age: '24, Cairo' },
  { avatar: '/images/user2.jpg', name: 'Mona', age: '28, Alex' },
  { avatar: '/images/user3.jpg', name: 'Sara', age: '26, Giza' },
  { avatar: '/images/user4.jpg', name: 'Lila', age: '30, Cairo' },
]

function triggerPeoplePop(el) {
  if (!el) return;
  el.classList.remove('updated');
  void el.offsetWidth;
  el.classList.add('updated');
}

export default function TripsSection({ onJoinToast, onCancelToast }) {
  const [joined, setJoined] = useState({});
  const [trips, setTrips] = useState([]);
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
        const tripItems = all.filter(i => String(i.Classification).toLowerCase() !== 'event')
        const picked = tripItems.slice(0, 4)

        const normalized = picked.map((item, idx) => {
          const id = String(item.ID || item.id)
          const host = MOCK_HOSTS[idx % MOCK_HOSTS.length]
          return {
            id,
            rawId: id,
            title: item.Name || 'Unnamed Trip',
            location: item.To || item.From || 'Egypt',
            image: item.Image || `https://picsum.photos/seed/${id}/800/600`,
            imageAlt: item.Name || 'Trip',
            avatar: host.avatar,
            avatarAlt: host.name,
            name: host.name,
            age: host.age,
            tags: item.Tags ? item.Tags.split(',').slice(0, 3).map(t => t.trim()) : [],
            dates: item.Start_Date || '',
            price: item.Cost_EGP ? `EGP ${item.Cost_EGP}` : '',
            peopleSeed: `3/10`,
          }
        })
        const peopleMap = {}
        normalized.forEach(t => { peopleMap[t.id] = { current: 3, max: 10 } })
        setTrips(normalized)
        setPeople(peopleMap)
      })
      .catch(err => console.error('Failed to load trips:', err))
  }, [])
  const handleToggle = useCallback((trip) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken')
    if (!token) {
      navigate('/login')
      return
    }
    
    const willJoin = !joinedRef.current[trip.id];
    setJoined((p) => ({ ...p, [trip.id]: willJoin }));
    setPeople((p) => {
      const { current, max } = p[trip.id];
      return {
        ...p,
        [trip.id]: {
          current: applyPeopleDelta(current, max, willJoin ? 1 : -1),
          max,
        },
      };
    });
    setTimeout(() => {
      const el = document.querySelector(`[data-trip-people="${trip.id}"]`);
      triggerPeoplePop(el);
    }, 0);

    if (willJoin) {
      if (token) {
        fetch('/api/v1/profile/join-trip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tripId: trip.rawId || trip.id }),
        }).catch(err => console.error('join-trip failed:', err))
      }
      const stored = JSON.parse(localStorage.getItem('joinedTrips') || '[]')
      if (!stored.find(t => String(t.id || t.ID) === String(trip.rawId || trip.id))) {
        stored.push({ ...trip, joinedAt: new Date().toISOString(), mode: 'trip' })
        localStorage.setItem('joinedTrips', JSON.stringify(stored))
      }
      onJoinToast?.(trip.title, trip.location, null)
    } else {
      if (token) {
        fetch('/api/v1/profile/leave-trip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tripId: trip.rawId || trip.id }),
        }).catch(err => console.error('leave-trip failed:', err))
      }
      const stored = JSON.parse(localStorage.getItem('joinedTrips') || '[]')
      localStorage.setItem('joinedTrips', JSON.stringify(
        stored.filter(t => String(t.id || t.ID) !== String(trip.rawId || trip.id))
      ))
      onCancelToast?.(trip.title, trip.location)
    }
  },
    [onJoinToast, onCancelToast]
  );

  return (
    <section className="sec3 reveal">
      <div className="heading2">
        <h2 className="main-sec2title">Join an Upcoming Trip <span className="emoji-icon">🎒</span> </h2>
        <p className="sec2-subtitle">Curated trips by experienced travelers waiting for you</p>
      </div>
      <div className="cards-container">
        {trips.map((trip) => {
          const isJoined = !!joined[trip.id];
          const { current, max } = people[trip.id];
          return (
            <div key={trip.id} className="trip2-card">
              <div className="image1">
                <img src={trip.image} alt={trip.imageAlt} />
                <span className="location">{trip.location}</span>
                <span className="people" data-trip-people={trip.id}>
                  {formatPeopleBadge(current, max)}
                </span>
                <div className="overlay" />
              </div>
              <div className="trip-content2">
                <div className="info">
                  <img src={trip.avatar} className="avatar" alt={trip.avatarAlt} />
                  <div>
                    <h4>{trip.name}</h4>
                    <p>{trip.age}</p>
                  </div>
                </div>
                <h2>{trip.title}</h2>
                <div className="tags">
                  {trip.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="trip-footer">
                  <span>{trip.dates}</span>
                  <span className="price">{trip.price}</span>
                </div>
                <button
                  type="button"
                  className={`join-btn${isJoined ? ' btn-cancel-state' : ''}`}
                  onClick={() => handleToggle(trip)}
                >
                  {isJoined ? '❌ Cancel Trip' : 'View Trip'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


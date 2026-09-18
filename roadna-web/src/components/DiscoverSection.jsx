import React from 'react';

const DESTINATIONS = [
  { title: 'Cairo', desc: 'Explore ancient pyramids and rich history', tag: 'History', icon: '🏛️', img: '/images/pyramids.webp' },
  { title: 'Luxor', desc: 'Ancient temples and pharaonic treasures', tag: 'Temples', icon: '🐫', img: '/images/2.jpg' },
  { title: 'Aswan', desc: 'Cruise the Nile in serene beauty', tag: 'Nile', icon: '🛥️', img: '/images/aswan.jpg' },
  { title: 'Dahab', desc: 'Adventure and desert vibes', tag: 'Desert', icon: '🌊', img: '/images/dahab2.jpg' },
  { title: 'Sharm El Sheikh', desc: 'Enjoy beaches and diving spots', tag: 'Diving', icon: '🐬', img: '/images/sharm-elsheikh.jpg' },
  { title: 'Alexandria', desc: 'Coastal beauty and history', tag: 'Sea', icon: '🏰', img: '/images/alexandria-coast.jpg' },
];

export default function DiscoverSection() {
  return (
    <section className="sec2 reveal">
      <div className="heading">
        <h2 className="main-sec2title">Discover Magical Egypt </h2>
        <p className="sec2-subtitle">From ancient pyramids to stunning Red Sea beaches</p>
      </div>
      <div className="parent">
        {DESTINATIONS.map((d) => (
          <div key={d.title} className="trip-card">
            <div className="img1">
              <img src={d.img} alt={d.title} />
            </div>
            <div className="overlay" />
            <div className="content">
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
              <span className="tag">{d.tag}</span>
            </div>
            <div className="icon">{d.icon}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

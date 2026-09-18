import React from 'react';

export default function TestimonialsSection() {
  return (
    <section className="sec5 reveal">
      <div className="heading2">
        <h2 className="main-sec2title">What Our Travelers Say <span className="emoji-icon">💬</span> </h2>
        <p className="sec2-subtitle">Real stories from real travelers</p>
      </div>
      <div className="container">
        <div className="cards">
          <div className="card">
            <div className="quote">{'"'}</div>
            <div className="stars">★★★★★</div>
            <p>Found the perfect diving buddies through Travel Mates! Our Dahab trip was unforgettable.</p>
            <div className="user">
              <img src="/images/hi.jpg" alt="Mariam" />
              <div>
                <h4>Mariam Ahmed</h4>
                <span>Dahab Diving Adventure</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="quote">{'"'}</div>
            <div className="stars">★★★★★</div>
            <p>As a solo traveler, I was nervous at first. This platform made it so easy to connect with amazing people!</p>
            <div className="user">
              <img src="/images/boy.jpg" alt="Ali" />
              <div>
                <h4>Ali Mahmoud</h4>
                <span>Cairo Historical Tour</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="quote">{'"'}</div>
            <div className="stars">★★★★★</div>
            <p>Best travel experience ever! Met wonderful people who share my passion for exploring.</p>
            <div className="user">
              <img src="/images/girl2.jpg" alt="Sara" />
              <div>
                <h4>Sara Khaled</h4>
                <span>Luxor Trip</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="quote">{'"'}</div>
            <div className="stars">★★★★★</div>
            <p>The matching system is brilliant. Found travel partners with similar interests easily!</p>
            <div className="user">
              <img src="/images/boy2.jpg" alt="Omar" />
              <div>
                <h4>Omar Hassan</h4>
                <span>Aswan Adventure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

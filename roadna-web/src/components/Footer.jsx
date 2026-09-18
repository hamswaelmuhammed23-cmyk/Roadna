import React from 'react';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="col">
            <Logo />
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
  );
}

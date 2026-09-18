import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  MessageSquare, 
  LogOut, 
  ChevronDown,
  Settings,
  Compass
} from 'lucide-react';
import Logo from './Logo.jsx';

export default function Header({ menuOpen, onMenuToggle, headerScrolled }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mock Authentication State (User requested this)
  const isLoggedIn = true; 

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      // No fallback mock user — after logout, user stays null
    } catch (err) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('otpVerified');
    localStorage.removeItem('joinedTrips');
    localStorage.removeItem('joinedEvents');
    localStorage.removeItem('savedTrips');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className={`header${headerScrolled ? ' scrolled' : ''}`}>
      <Logo theme="light" size="md" />
      
      <ul className={`links${menuOpen ? ' open' : ''}`}>
        <li><Link to="/explore">Explore</Link></li>
        <li><Link to="/how-it-works">How it work</Link></li>
        <li><Link to="/chat">Messages</Link></li>
        <li><Link to="/contact">Contact US</Link></li>
        <li><Link to="/about">About US</Link></li>
      </ul>

      <div className="flex items-center gap-4">
        <button type="button" className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Conditional Rendering: Register vs Avatar Dropdown */}
        {!user ? (
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '8px 20px', 
                borderRadius: '10px', 
                border: '2px solid #2F80ED', 
                background: 'transparent', 
                color: '#2F80ED', 
                fontWeight: '700', 
                fontSize: '14px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.target.style.background = '#2F80ED'; e.target.style.color = '#fff'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#2F80ED'; }}
            >
              Login
            </button>
            <button 
              type="button" 
              className="btn1"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Avatar Button with Subtle Glow */}
            <motion.div 
              className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-all duration-300 relative group"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileActive={{ scale: 0.95 }}
            >
              {/* Subtle Glow behind avatar */}
              <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm relative z-10">
                {user.photo ? (
                  <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-300 hidden md:block ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </motion.div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  {/* Click away overlay */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="absolute right-0 top-full mt-5 w-72 bg-white/85 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-white/40 overflow-hidden z-[1000] p-4 pt-4 pb-10"
                  >
                    {/* Floating Profile Card Header */}
                    <div style={{ paddingTop: '3rem', paddingBottom: '1rem' }} className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
                          <img 
                            src={user.photo || 'https://i.pravatar.cc/150?u=nada'} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-black text-slate-900 leading-tight">
                        {user.name || 'User'}
                      </h4>
                      <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mt-1">Adventure Traveler</p>
                    </div>

                    <div className="h-px bg-slate-100/60 mx-6 mb-3" />

                    {/* Menu Items */}
                    <div className="flex flex-col gap-1 px-1">
                      {[
                        ...(user && user.role === 'admin' ? [{ to: "/admin", icon: Settings, label: "Admin Panel" }] : []),
                        { to: "/explore", icon: Compass, label: "Explore" },
                        { to: "/profile", icon: User, label: "Profile" },
                        { to: "/chat", icon: MessageSquare, label: "Messages" }
                      ].map((item) => (
                        <Link 
                          key={item.label}
                          to={item.to} 
                          className="flex items-center gap-4 px-4 py-3 text-[14px] font-bold text-slate-600 hover:bg-blue-50/80 hover:text-blue-600 rounded-2xl transition-all duration-300 group"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                            <item.icon size={18} className="text-slate-400 group-hover:text-blue-500 transition-all duration-300 group-hover:-translate-y-0.5" />
                          </div>
                          <span>{item.label}</span>
                        </Link>
                      ))}

                      <div className="h-px bg-slate-100/60 mx-6 my-2" />

                      <button 
                        style={{ marginBottom: '1.5rem' }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-[14px] font-black text-rose-500 hover:bg-rose-50/80 transition-all duration-300 rounded-2xl group"
                      >
                        <div className="w-10 h-10 rounded-full bg-rose-50/50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                          <LogOut size={18} className="text-rose-400 group-hover:text-rose-600 transition-all duration-300 group-hover:-translate-x-1" />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

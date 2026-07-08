import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

function GithubIcon({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('uploader-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollToUpload: true } });
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '#about', isAnchor: true },
    { name: 'GitHub', path: 'https://github.com', isExternal: true },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-5">
        <nav 
          className={`mx-auto rounded-full w-[95%] max-w-6xl transition-all duration-300 ${
            isScrolled 
              ? 'glass-panel bg-[#050814]/75 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2.5 px-6' 
              : 'glass-panel bg-[#070b19]/45 border-white/5 py-3.5 px-8'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity"
            >
              <img src="/logoo.png" alt="Logo" className="h-7 w-auto object-contain rounded-md" />
              <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                PRONUNCE.<span className="text-cyan-400">AI</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                if (link.isExternal) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-full"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>{link.name}</span>
                    </a>
                  );
                }

                if (link.isAnchor) {
                  return (
                    <button
                      key={link.name}
                      onClick={() => setShowAbout(true)}
                      className="text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-full cursor-pointer"
                    >
                      {link.name}
                    </button>
                  );
                }

                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={`text-xs font-semibold py-2 px-4 relative rounded-full transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavBackground"
                        className="absolute inset-0 bg-white/5 border border-white/10 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </NavLink>
                );
              })}
              
              <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
              
              <button 
                onClick={handleStartClick}
                className="px-4.5 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-cyan-400 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
              >
                Analyze Speech
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 focus:outline-none transition-colors"
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mx-auto mt-2 rounded-2xl w-[95%] glass-panel bg-slate-950/95 shadow-2xl p-4 space-y-2 border border-white/10"
            >
              {navLinks.map((link) => {
                if (link.isExternal) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <GithubIcon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </a>
                  );
                }
                if (link.isAnchor) {
                  return (
                    <button
                      key={link.name}
                      onClick={() => {
                        setIsOpen(false);
                        setShowAbout(true);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {link.name}
                    </button>
                  );
                }
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'text-white bg-white/5 border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </NavLink>
                );
              })}
              <button
                onClick={(e) => {
                  setIsOpen(false);
                  handleStartClick(e);
                }}
                className="block w-full text-center px-4 py-2.5 mt-4 text-xs font-extrabold text-slate-950 bg-white hover:bg-cyan-400 rounded-full shadow-md cursor-pointer"
              >
                Analyze Speech
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Non-blocking Premium Glass About Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-[#03050a]/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md glass-panel border-white/10 bg-[#070c1a]/95 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden shimmer-effect"
            >
              <div className="absolute -right-12 -top-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -left-12 -bottom-12 w-28 h-28 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>

              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3.5 border-b border-white/5 pb-3">About Pronounce.AI</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Pronounce.AI is an advanced voice analysis and oral assessment platform. 
                Our neural models inspect phonetic accent structures, cadence rhythm, and word stress alignments, returning granular diagnostics to calibrate articulation towards native accents.
              </p>
              
              <button 
                onClick={() => setShowAbout(false)}
                className="mt-6 w-full py-3 text-xs font-bold uppercase tracking-widest text-slate-950 bg-white hover:bg-cyan-400 rounded-full transition-all cursor-pointer"
              >
                Dismiss Panel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

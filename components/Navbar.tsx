
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', show: true },
    { name: 'Admin', path: '/admin', show: user?.role === 'admin' },
  ].filter(link => link.show);

  const handleSignOut = async () => {
    try {
      await logout();
      closeMenu();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-md border-b border-zinc-900 text-white px-6 md:px-10 h-auto min-h-[80px] py-3 flex justify-between items-center sticky top-0 z-[1000]">
        <div className="flex items-center gap-3">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-4 group">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center font-black text-black text-[12px] transition-transform group-hover:scale-105">R</div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tighter uppercase">Reveal <span className="text-zinc-700">System</span></span>
              {user && (
                <span className="text-[9px] font-mono text-zinc-600 mt-0.5">{user.email}</span>
              )}
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${location.pathname === link.path ? 'text-white border-b-2 border-white pb-1' : 'text-zinc-600 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          <button 
            onClick={handleSignOut}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-800 hover:text-rose-600 transition-colors ml-6"
          >
            Sign out
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-3 text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded-lg"
          aria-label="Open Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </nav>

      {/* Fullscreen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black z-[99999] md:hidden flex flex-col p-8 animate-in fade-in duration-300">
          {/* Dedicated Close Button in Top Right */}
          <div className="flex justify-end pt-4 pr-2">
            <button 
              onClick={closeMenu}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white hover:bg-zinc-800 transition-all active:scale-95 shadow-xl"
              aria-label="Close Menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col flex-1 justify-center items-center text-center gap-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-6">Navigation Hub</p>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    onClick={closeMenu}
                    className={`text-6xl font-bold tracking-tighter transition-all active:scale-90 ${location.pathname === link.path ? 'text-white underline underline-offset-[12px] decoration-zinc-800' : 'text-zinc-900'}`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="h-px w-24 bg-zinc-900 my-4"></div>
            
            <button 
              onClick={handleSignOut}
              className="text-3xl font-bold tracking-tighter text-zinc-700 hover:text-rose-600 transition-colors active:scale-95"
            >
              Sign out
            </button>
          </div>
          
          <div className="mt-auto pb-10 flex flex-col items-center">
             <div className="flex items-center gap-3 mb-6 bg-zinc-900/50 px-6 py-2 rounded-full border border-zinc-800/50">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em]">System Secured</p>
             </div>
             <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] text-center">
               © 2025 Mentalism Labs • Alpha Terminal<br/>
               Restricted Access Infrastructure
             </p>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#FDFDFC]/95 backdrop-blur-md border-b border-slate-200 py-4' 
          : 'bg-transparent py-8 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-bold tracking-[0.2em] text-slate-900 uppercase">Vocalis</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-12 text-xs font-semibold tracking-[0.15em] uppercase text-slate-500">
          <a href="#benefits" className="hover:text-slate-900 transition-colors">Product</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
        </nav>

        <Link 
          to="/signup"
          className="group relative inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-sm"
        >
          <span>Get Started &rarr;</span>
        </Link>
      </div>
    </header>
  );
};

export default LandingNavbar;

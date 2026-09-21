import React from 'react';

const LandingFooter = () => {
  return (
    <footer className="bg-[#FAFAFA] py-16 px-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        
        <div className="flex flex-col items-center md:items-start gap-3">
          <span className="text-sm font-bold tracking-[0.2em] text-slate-900 uppercase">Vocalis</span>
          <span className="text-slate-400 text-[10px] font-bold tracking-[0.1em] uppercase">Turn Your Words Into Voice.</span>
        </div>
        
        <nav className="flex items-center gap-8 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
          <a href="#benefits" className="hover:text-slate-900 transition-colors">Product</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
        </nav>
        
        <div className="text-[10px] text-slate-400 font-bold tracking-[0.1em] uppercase">
          &copy; {new Date().getFullYear()} Vocalis.
        </div>
        
      </div>
    </footer>
  );
};

export default LandingFooter;

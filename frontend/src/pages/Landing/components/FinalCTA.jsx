import React from 'react';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  return (
    <section className="py-32 md:py-48 px-8 bg-[#FDFDFC]">
      <div className="max-w-4xl mx-auto text-center border-t border-slate-200 pt-32 md:pt-48">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-slate-900 mb-8 leading-[1.1]">
          Your words are ready<br />to be heard.
        </h2>
        <p className="text-slate-500 text-lg md:text-xl font-light mb-16 max-w-2xl mx-auto leading-relaxed">
          Create natural-sounding speech from your text with Vocalis. No complex setups, just pure voice generation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Link 
            to="/signup"
            className="px-10 py-5 bg-slate-900 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-slate-800 transition-colors inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

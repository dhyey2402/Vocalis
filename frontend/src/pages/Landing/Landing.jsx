import React from 'react';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import BenefitsSection from './components/BenefitsSection';
import HowItWorks from './components/HowItWorks';
import FeatureShowcase from './components/FeatureShowcase';
import FinalCTA from './components/FinalCTA';
import LandingFooter from './components/LandingFooter';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFC] font-sans text-slate-900 overflow-x-hidden selection:bg-slate-200">
      <LandingNavbar />
      <main>
        <HeroSection />
        
        {/* INTRODUCTORY PRODUCT STATEMENT */}
        <section className="w-full max-w-7xl mx-auto px-8 md:px-12 py-32 border-t border-slate-200">
           <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase mb-8">
             Built for simple listening
           </h2>
           <p className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] text-slate-900 mb-8 max-w-4xl">
             Sometimes text is better heard<br className="hidden md:block" /> than read.
           </p>
           <p className="text-lg md:text-xl text-slate-500 max-w-2xl font-light leading-relaxed">
             Vocalis turns written content into speech through a simple workflow designed around text, voice, and listening. No unnecessary features, just pure voice generation.
           </p>
        </section>
        
        <BenefitsSection />
        <HowItWorks />
        <FeatureShowcase />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;

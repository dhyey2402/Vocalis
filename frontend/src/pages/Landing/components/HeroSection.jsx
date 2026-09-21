import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductPreviewMockup = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full relative z-10 text-left mt-12 lg:mt-0">
      <audio 
        ref={audioRef} 
        src="/demo/demo_en.mp3" 
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="bg-white border border-slate-200 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-sm flex flex-col gap-8">
        
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Text To Speech</span>
        </div>

        <div className="text-slate-800 font-serif text-lg md:text-xl leading-relaxed italic">
          "The quick brown fox jumps over the lazy dog. Vocalis allows you to bring your text to life instantly."
        </div>
        
        <div className="flex gap-12 border-t border-slate-100 pt-6">
          <div>
            <span className="block text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1.5">Language</span>
            <span className="text-sm font-medium text-slate-900">English</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1.5">Voice</span>
            <span className="text-sm font-medium text-slate-900">Bella</span>
          </div>
        </div>

        <div className="bg-[#FDFDFC] border border-slate-200 rounded-sm p-5 flex items-center gap-6 mt-4">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white flex-shrink-0 hover:bg-slate-800 transition-colors rounded-sm cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </button>
          
          <div className="flex-grow flex items-center gap-0.5 h-8">
            {[40, 70, 30, 90, 60, 40, 80, 50, 100, 30, 60, 40, 80, 20, 50, 70, 40, 90].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 transition-all duration-300 ease-in-out ${isPlaying ? 'bg-blue-900' : 'bg-slate-200'}`} 
                style={{ 
                  height: isPlaying ? `${h}%` : '15%', 
                  transitionDelay: isPlaying ? `${i * 30}ms` : '0ms'
                }}
              ></div>
            ))}
          </div>
          
          <button className="text-slate-400 cursor-default flex-shrink-0">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <button className="w-full bg-transparent border border-slate-200 text-slate-500 py-4 text-xs font-bold tracking-widest uppercase hover:text-slate-900 hover:border-slate-300 transition-colors rounded-sm cursor-default">
          Download Audio
        </button>

      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
        
        <div className="w-full lg:w-1/2 flex flex-col items-start relative z-10">
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-8">
            Intelligent Text-to-Speech
          </span>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-slate-900 mb-8 leading-[1.05]">
            Turn written words<br />into a voice<br />worth hearing.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-md font-light leading-relaxed">
            Vocalis transforms written text into natural-sounding speech. Choose a language and voice, generate audio, and listen instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <Link 
              to="/signup"
              className="px-8 py-4 bg-slate-900 text-white text-xs font-semibold tracking-[0.1em] uppercase rounded-sm hover:bg-slate-800 transition-colors inline-block"
            >
              Get Started
            </Link>
            <a 
              href="#how-it-works"
              className="text-xs font-semibold tracking-[0.1em] uppercase text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              Explore how it works &rarr;
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <ProductPreviewMockup />
        </div>
        
      </div>
    </section>
  );
};

export default HeroSection;

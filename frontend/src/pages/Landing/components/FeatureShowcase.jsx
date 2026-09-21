import React from 'react';
import { Play, Volume2 } from 'lucide-react';

const FeatureShowcase = () => {
  return (
    <section id="features" className="py-32 bg-[#FDFDFC]">
      
      {/* SECTION A — TEXT */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 mb-40 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
        <div className="w-full lg:w-[45%]">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">Write with clarity.</h2>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md">
            Enter or paste your text and keep track of characters and words as you work in a completely distraction-free editor.
          </p>
        </div>
        <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white border border-slate-200 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-sm">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Text to Speech</span>
              <span className="text-[10px] font-bold tracking-[0.1em] text-slate-400 hover:text-slate-900 cursor-pointer transition-colors uppercase">Clear</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 h-48 text-slate-700 font-medium text-sm leading-relaxed relative rounded-sm">
              The creative process begins here. Keep track of your character count in real time while you formulate the perfect script.
              <span className="inline-block w-0.5 h-4 bg-slate-900 ml-1 animate-pulse align-middle"></span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mt-4">
              <span>Words: <strong className="text-slate-600">22</strong></span>
              <span>132 / 5000</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B — LANGUAGE & VOICE */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 mb-40 flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-32">
        <div className="w-full lg:w-[55%] flex justify-center lg:justify-start">
          <div className="w-full max-w-xl flex flex-col gap-6">
            <div className="bg-white border border-slate-200 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-sm">
              <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3">Language</span>
              <div className="bg-slate-50 border border-slate-200 p-4 text-slate-900 text-sm font-medium flex justify-between items-center rounded-sm">
                <span>Spanish</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-sm relative left-0 lg:left-12">
              <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3">Voice</span>
              <div className="bg-slate-50 border border-slate-200 p-4 text-slate-900 text-sm font-medium flex justify-between items-center rounded-sm">
                <span>Matilda</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[45%]">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">Choose your voice.</h2>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md">
            Select a supported language and an authentic voice suited to your content.
          </p>
        </div>
      </div>

      {/* SECTION C — AUDIO */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
        <div className="w-full lg:w-[45%]">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">Listen. Then take it with you.</h2>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md">
            Generate speech, listen directly in the browser, and download the resulting audio file.
          </p>
        </div>
        <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
          <div className="w-full max-w-xl bg-white border border-slate-200 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-sm">
            <div className="bg-slate-50 border border-slate-200 p-6 flex items-center gap-6 rounded-sm">
              <button className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white flex-shrink-0 cursor-default rounded-sm">
                <Play className="w-5 h-5 fill-current ml-1" />
              </button>
              <div className="flex-grow">
                <div className="h-0.5 w-full bg-slate-200 overflow-hidden mb-3">
                  <div className="h-full bg-slate-900 w-1/3 relative"></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-slate-400">
                  <span>0:14</span>
                  <span>0:42</span>
                </div>
              </div>
              <button className="text-slate-400 cursor-default flex-shrink-0">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-6 py-3 bg-transparent text-slate-500 text-[10px] font-bold tracking-[0.15em] uppercase border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-colors rounded-sm flex items-center gap-3 cursor-default">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Audio
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default FeatureShowcase;

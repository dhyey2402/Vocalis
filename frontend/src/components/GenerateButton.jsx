import React from 'react';
import { Loader2 } from 'lucide-react';

const GenerateButton = ({ onClick, disabled, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative px-8 py-3.5 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 rounded-lg overflow-hidden group
        flex items-center justify-center gap-2.5
        ${disabled || isLoading 
          ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
          : 'bg-gradient-to-b from-slate-800 to-slate-950 text-white hover:from-slate-700 hover:to-slate-900 shadow-[0_4px_14px_0_rgba(15,23,42,0.2)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
        }
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin relative z-10" />
          <span className="relative z-10">Generating...</span>
          <div className="absolute inset-0 bg-white/10 animate-pulse" />
        </>
      ) : (
        <>
          <span className="relative z-10">Generate Speech</span>
          <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </>
      )}
    </button>
  );
};

export default GenerateButton;

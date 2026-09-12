import React from 'react';
import { Play, Loader2 } from 'lucide-react';

const GenerateButton = ({ onClick, disabled, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full sm:w-auto relative group overflow-hidden rounded-xl font-semibold text-white px-8 py-3.5 transition-all
        flex items-center justify-center gap-2
        ${disabled || isLoading 
          ? 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-80' 
          : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98]'
        }
      `}
    >
      {/* Button background effect for enabled state */}
      {!(disabled || isLoading) && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      )}
      
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Play className="w-5 h-5 fill-current" />
          <span>Generate Speech</span>
        </>
      )}
    </button>
  );
};

export default GenerateButton;

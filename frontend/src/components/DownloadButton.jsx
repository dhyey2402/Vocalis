import React from 'react';
import { Download } from 'lucide-react';

const DownloadButton = ({ audioUrl, disabled }) => {
  return (
    <button
      disabled={disabled || !audioUrl}
      className={`
        w-full sm:w-auto relative group overflow-hidden rounded-xl font-semibold px-6 py-3.5 transition-all
        flex items-center justify-center gap-2 border
        ${disabled || !audioUrl
          ? 'bg-slate-900/50 border-white/5 text-slate-500 cursor-not-allowed' 
          : 'bg-slate-800/80 hover:bg-slate-700 border-white/10 text-white hover:border-white/20 active:scale-[0.98]'
        }
      `}
    >
      <Download className="w-5 h-5" />
      <span>Download Audio</span>
    </button>
  );
};

export default DownloadButton;

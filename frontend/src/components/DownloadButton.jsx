import React from 'react';
import { Download } from 'lucide-react';
import { API_BASE_URL } from '../api/config';

const DownloadButton = ({ audioUrl, disabled }) => {
  const handleDownload = async () => {
    if (!audioUrl) return;
    
    try {
      const baseUrl = API_BASE_URL.replace(/\/api$/, '');
      const url = audioUrl.startsWith('/') ? `${baseUrl}${audioUrl}` : audioUrl;
      
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Vocalis-generated-speech.mp3';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download audio:", error);
      alert("Failed to download the generated audio file.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !audioUrl}
      className={`
        text-xs font-bold uppercase tracking-[0.1em] transition-all rounded-lg
        flex items-center gap-2 px-5 py-2.5 border
        ${disabled || !audioUrl
          ? 'bg-transparent border-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
          : 'bg-white border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm hover:shadow active:scale-[0.98]'
        }
      `}
    >
      <Download className="w-3.5 h-3.5" />
      <span>Download Audio</span>
    </button>
  );
};

export default DownloadButton;

import React, { useState } from 'react';
import { useVocalis } from '../context/VocalisContext';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioPlayer = ({ audioUrl, isLoading }) => {
  const { state, audioControls } = useVocalis();
  const { audioMeta } = state;
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioControls.setMuted(newMuted);
  };

  const handleSeek = (e) => {
    if (audioUrl) {
      const seekTime = (e.target.value / 100) * audioMeta.duration;
      audioControls.seek(seekTime);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-slate-200/80 rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[100px] shadow-sm">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        <p className="text-xs font-bold tracking-[0.1em] text-slate-400 uppercase">Generating audio...</p>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="w-full bg-white border border-dashed border-slate-200/80 rounded-xl p-8 flex flex-col items-center justify-center gap-2 min-h-[100px] shadow-sm">
        <p className="text-xs font-bold tracking-[0.1em] text-slate-400 uppercase">No audio generated yet</p>
        <p className="text-xs text-slate-400">Generate speech to see your audio here.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-xl p-5 transition-all shadow-sm hover:border-slate-300">
      <div className="flex items-center gap-5">
        <button
          onClick={audioControls.togglePlay}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 rounded-full"
          aria-label={audioMeta.isPlaying ? 'Pause' : 'Play'}
        >
          {audioMeta.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <div className="flex-grow flex flex-col gap-1.5">
          <input
            type="range"
            min="0"
            max="100"
            value={audioMeta.progress || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-slate-900 focus:outline-none rounded-none"
            aria-label="Seek audio"
          />
          <div className="flex justify-between text-[10px] font-bold tracking-[0.05em] text-slate-400">
            <span>{formatTime(audioMeta.currentTime)}</span>
            <span>{formatTime(audioMeta.duration)}</span>
          </div>
        </div>

        <button
          onClick={toggleMute}
          className="flex-shrink-0 text-slate-400 hover:text-slate-900 transition-colors p-1"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;

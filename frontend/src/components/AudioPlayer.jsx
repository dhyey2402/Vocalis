import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Loader2 } from 'lucide-react';

const AudioPlayer = ({ audioUrl, isLoading }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      // Reset state when new audio comes in
      setProgress(0);
      setIsPlaying(false);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current && audioUrl) {
      const seekTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Generating audio...</p>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="w-full bg-slate-900/30 border border-white/5 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <div className="bg-slate-800/50 p-3 rounded-full text-slate-500">
          <Music className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-500">Your generated audio will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/60 border border-white/10 shadow-lg rounded-xl p-4 sm:p-6 transition-all">
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>

        <div className="flex-grow flex flex-col gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <button
          onClick={toggleMute}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-2"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
      
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default AudioPlayer;

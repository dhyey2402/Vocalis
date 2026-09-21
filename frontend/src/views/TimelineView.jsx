import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';
import { useVocalis } from '../context/VocalisContext';
import { AVAILABLE_VOICES } from '../data/voices';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const TimelineView = () => {
  const { state, audioControls } = useVocalis();
  const { activeGenerationMetadata, audioMeta } = state;
  const canvasRef = useRef(null);
  const timelineRef = useRef(null);
  const [waveformPeaks, setWaveformPeaks] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(false);

  const hasData = !!activeGenerationMetadata;
  const progressPercent = audioMeta.duration > 0 ? (audioMeta.currentTime / audioMeta.duration) * 100 : 0;

  const currentVoice = useMemo(() => {
    if (!hasData) return null;
    return AVAILABLE_VOICES.find(v => v.id === activeGenerationMetadata.voice) || { name: activeGenerationMetadata.voice, languageName: activeGenerationMetadata.language };
  }, [hasData, activeGenerationMetadata]);

  // Extract Waveform
  useEffect(() => {
    if (!hasData || !activeGenerationMetadata.audio_url) return;
    
    let isMounted = true;
    const extractWaveform = async () => {
      setIsExtracting(true);
      setExtractError(false);
      try {
        const response = await fetch(activeGenerationMetadata.audio_url, { credentials: 'include' });
        if (!response.ok) throw new Error("Failed to fetch audio for waveform");
        
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Downsample to 200 peaks
        const channelData = audioBuffer.getChannelData(0);
        const step = Math.ceil(channelData.length / 200);
        const peaks = [];
        
        for (let i = 0; i < 200; i++) {
          let min = 1.0;
          let max = -1.0;
          for (let j = 0; j < step; j++) {
            const datum = channelData[(i * step) + j]; 
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
          peaks.push(Math.max(Math.abs(min), Math.abs(max)));
        }
        
        if (isMounted) setWaveformPeaks(peaks);
      } catch (err) {
        console.error("Waveform extraction error:", err);
        if (isMounted) setExtractError(true);
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };
    
    extractWaveform();
    return () => { isMounted = false; };
  }, [hasData, activeGenerationMetadata?.audio_url]);

  // Draw Waveform Canvas
  useEffect(() => {
    if (!canvasRef.current || waveformPeaks.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate played portion pixel width
    const playedWidth = (progressPercent / 100) * width;
    
    const barWidth = width / waveformPeaks.length;
    
    waveformPeaks.forEach((peak, i) => {
      const x = i * barWidth;
      const barHeight = Math.max(2, peak * height);
      const y = (height - barHeight) / 2;
      
      const isPlayed = x <= playedWidth;
      
      ctx.fillStyle = isPlayed ? '#0f172a' : '#cbd5e1'; // slate-900 vs slate-300
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });
  }, [waveformPeaks, progressPercent]);

  // Estimate Section Proportions
  const sectionLayouts = useMemo(() => {
    if (!hasData || !activeGenerationMetadata.sections || activeGenerationMetadata.sections.length === 0) return [];
    
    const sections = activeGenerationMetadata.sections;
    const totalChars = sections.reduce((sum, s) => sum + (s.text || '').length, 0);
    const totalDuration = activeGenerationMetadata.duration || audioMeta.duration || 0;
    
    if (totalChars === 0 || totalDuration === 0) return [];
    
    let currentStartTime = 0;
    
    return sections.map(section => {
      const chars = (section.text || '').length;
      const proportion = chars / totalChars;
      const duration = proportion * totalDuration;
      const start = currentStartTime;
      const end = start + duration;
      currentStartTime = end;
      
      const words = (section.text || '').split(/\s+/).filter(w => w.length > 0).length;
      
      return {
        ...section,
        proportion,
        start,
        end,
        words
      };
    });
  }, [hasData, activeGenerationMetadata, audioMeta.duration]);

  // Handle Timeline Click
  const handleTimelineClick = (e) => {
    if (timelineRef.current && (activeGenerationMetadata?.duration || audioMeta.duration)) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const duration = activeGenerationMetadata.duration || audioMeta.duration;
      audioControls.seek(percentage * duration);
    }
  };

  const activeSectionId = useMemo(() => {
    if (!sectionLayouts.length) return null;
    const t = audioMeta.currentTime;
    const active = sectionLayouts.find(s => t >= s.start && t < s.end);
    return active ? active.id : (t >= sectionLayouts[sectionLayouts.length - 1].end ? sectionLayouts[sectionLayouts.length - 1].id : sectionLayouts[0].id);
  }, [audioMeta.currentTime, sectionLayouts]);

  // Pauses from Listening Intelligence
  const pauses = useMemo(() => {
    if (!hasData || !activeGenerationMetadata.listeningData || !activeGenerationMetadata.listeningData.opportunities) return [];
    const totalChars = (activeGenerationMetadata.text || '').length;
    if (totalChars === 0) return [];
    
    return activeGenerationMetadata.listeningData.opportunities
      .filter(opp => opp.message.toLowerCase().includes('pause'))
      .map((opp, i) => {
        return {
           id: `pause-${i}`,
           proportion: (i + 1) / (activeGenerationMetadata.listeningData.opportunities.length + 1)
        };
      });
  }, [hasData, activeGenerationMetadata]);

  if (!hasData) {
    return (
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Voice Timeline</h1>
          <p className="text-sm text-slate-500 font-light">Visualize your generated speech and track playback.</p>
        </div>
        <div className="bg-slate-50/50 border border-dashed border-slate-200/80 rounded-xl p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">No timeline data available</p>
          <p className="text-xs text-slate-400">Generate speech or select a recording from your Library to view its timeline.</p>
        </div>
      </div>
    );
  }

  const durationStr = formatTime(activeGenerationMetadata.duration || audioMeta.duration);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Voice Timeline</h1>
        <p className="text-sm text-slate-500 font-light">Visual production analysis for your generated speech.</p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-slate-100 p-6 md:p-8 bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{activeGenerationMetadata.title || "Voice Generation"}</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
               {activeGenerationMetadata.language}
            </span>
            <span className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
               {currentVoice?.name}
            </span>
            <span className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
               {durationStr}
            </span>
            <span className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
               Generated {formatDate(activeGenerationMetadata.created_at)}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          
          {/* Top Controls & Current Time */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={audioControls.togglePlay}
                className="flex-shrink-0 w-14 h-14 bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 rounded-full"
                aria-label={audioMeta.isPlaying ? 'Pause' : 'Play'}
              >
                {audioMeta.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <div className="flex flex-col">
                <span className="text-3xl font-semibold text-slate-900 tracking-tighter tabular-nums leading-none">
                  {formatTime(audioMeta.currentTime)}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  of {durationStr}
                </span>
              </div>
            </div>
            
            <div className="text-right hidden sm:block">
              {isExtracting ? (
                <span className="text-xs font-semibold text-slate-400 flex items-center justify-end gap-2 uppercase tracking-widest"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing audio...</span>
              ) : extractError ? (
                <span className="text-xs font-semibold text-red-400 flex items-center justify-end gap-1 uppercase tracking-widest"><AlertCircle className="w-3 h-3" /> Waveform error</span>
              ) : (
                <span className="text-xs font-semibold text-slate-400 flex items-center justify-end uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></div>
                  Audio Analyzed
                </span>
              )}
            </div>
          </div>

          {/* Timeline Container */}
          <div className="relative mb-8 select-none" ref={timelineRef} onClick={handleTimelineClick}>
            
            {/* Time Ruler */}
            <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">
               <span>0:00</span>
               {/* Show intermediate markers if duration is long enough */}
               {activeGenerationMetadata.duration > 30 && (
                 <span>{formatTime(activeGenerationMetadata.duration / 2)}</span>
               )}
               <span>{durationStr}</span>
            </div>
            
            {/* Playhead Background Fill */}
            <div className="absolute inset-x-0 bottom-0 top-[28px] bg-slate-50/50 rounded-lg pointer-events-none border border-slate-100" />
            
            {/* Waveform Canvas */}
            <div className="relative h-24 mb-2 cursor-pointer z-10 mx-px mt-1">
              {!isExtracting && !extractError && (
                <canvas 
                  ref={canvasRef} 
                  width={1000} 
                  height={96} 
                  className="w-full h-full pointer-events-none"
                />
              )}
              {(isExtracting || extractError) && (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <div className="w-full h-8 bg-slate-200 rounded animate-pulse"></div>
                </div>
              )}
              
              {/* Playhead Line */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-slate-900 z-20 transition-all duration-75 shadow-[0_0_8px_rgba(15,23,42,0.5)]"
                style={{ left: `${progressPercent}%` }}
              >
                <div className="absolute -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-900" />
              </div>
            </div>

            {/* Section Track */}
            {sectionLayouts.length > 0 && (
              <div className="relative h-8 bg-slate-100 rounded-md overflow-hidden flex border border-slate-200/50 shadow-inner z-10 cursor-pointer">
                {sectionLayouts.map((section, i) => (
                  <div
                    key={section.id}
                    className={`h-full border-r border-slate-200/60 last:border-r-0 flex items-center justify-center relative transition-colors ${
                      activeSectionId === section.id ? 'bg-slate-800 text-white shadow-inner' : 'bg-transparent text-slate-400 hover:bg-slate-200'
                    }`}
                    style={{ width: `${section.proportion * 100}%` }}
                  >
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase truncate px-2">
                      {section.name || `Section ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pause Markers Track */}
            {pauses.length > 0 && (
              <div className="relative h-3 mt-1 pointer-events-none">
                {pauses.map(p => (
                  <div 
                    key={p.id}
                    className="absolute top-0 w-1.5 h-1.5 rounded-full bg-amber-400 -translate-x-1/2 shadow-sm"
                    style={{ left: `${p.proportion * 100}%` }}
                    title="Suggested Pause"
                  />
                ))}
              </div>
            )}

          </div>

          {/* Section Details Panel */}
          {sectionLayouts.length > 0 ? (
            <div className="mt-12 border-t border-slate-100 pt-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Production Script</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionLayouts.map((section, i) => (
                  <div 
                    key={section.id} 
                    onClick={() => audioControls.seek(section.start)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      activeSectionId === section.id 
                        ? 'bg-slate-50 border-slate-400 shadow-sm' 
                        : 'bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{String(i+1).padStart(2, '0')} · {section.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                        {formatTime(section.start)} — {formatTime(section.end)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed mb-3">
                      {section.text || "No script content."}
                    </p>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{section.words} words</span>
                      <span>Est. {Math.round(section.end - section.start)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 border-t border-slate-100 pt-8">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Production Script</h3>
               <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 p-5 rounded-lg">
                 This generation does not have Voice Director sections. The entire script was processed as a single continuous take.
               </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TimelineView;

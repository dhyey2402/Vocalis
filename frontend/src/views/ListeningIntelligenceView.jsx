import React, { useEffect, useState } from 'react';
import { useVocalis } from '../context/VocalisContext';
import { analyzeListening } from '../services/listeningIntelligence';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SeverityDot = ({ severity }) => {
  const color = severity === 'high' ? 'bg-red-400' : severity === 'moderate' ? 'bg-amber-400' : 'bg-slate-300';
  return <span className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0 mt-1.5`} />;
};

const ListeningIntelligenceView = () => {
  const { state, dispatch } = useVocalis();
  const { text } = state;
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = analyzeListening(text);
      setAnalysis(result);
      dispatch({ type: 'SET_LISTENING_ANALYSIS', payload: result });
    }, 500);
    return () => clearTimeout(timer);
  }, [text, dispatch]);

  const scoreColor = (score) => {
    if (score >= 85) return 'text-emerald-700';
    if (score >= 70) return 'text-slate-900';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Listening Intelligence</h1>
          <p className="text-sm text-slate-500 font-light">Analyze how your text will sound when spoken aloud.</p>
        </div>
      </div>

      {!analysis ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200/80 rounded-xl p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">No analysis available</p>
          <p className="text-xs text-slate-400">Add some text in the Create workspace to analyze spoken delivery.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Score */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] p-6 md:p-8">
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">Listening Score</h2>
              <div className="text-center mb-6">
                <span className={`text-6xl font-bold tracking-tight ${scoreColor(analysis.score)}`}>{analysis.score}</span>
                <span className="text-lg text-slate-400 ml-1">/ 100</span>
              </div>
              <p className="text-sm text-center text-slate-500 font-medium">{analysis.label}</p>

              <div className="border-t border-slate-100 mt-8 pt-6">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Stats</h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Sentences</span>
                    <span className="font-semibold text-slate-600">{analysis.stats.sentenceCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Avg. words/sentence</span>
                    <span className="font-semibold text-slate-600">{analysis.stats.avgWordsPerSentence}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Paragraphs</span>
                    <span className="font-semibold text-slate-600">{analysis.stats.paragraphCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pause points</span>
                    <span className="font-semibold text-slate-600">{analysis.stats.pausePoints}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-50">
                    <span className="text-slate-500 font-medium">Est. duration</span>
                    <span className="font-semibold text-slate-900">{formatTime(analysis.stats.estimatedDurationSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities */}
          <div className="flex-grow bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
            <div className="p-6 md:p-10">
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">Opportunities</h2>

              {analysis.opportunities.length === 0 ? (
                <p className="text-sm text-slate-400">No issues detected. Your text is well-structured for spoken delivery.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {analysis.opportunities.map((opp, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
                      <SeverityDot severity={opp.severity} />
                      <div>
                        <p className="text-sm text-slate-700">{opp.message}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-bold">{opp.severity} priority</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ListeningIntelligenceView;

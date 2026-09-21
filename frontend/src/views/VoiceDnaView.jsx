import React, { useEffect, useState } from 'react';
import { useVocalis } from '../context/VocalisContext';
import { analyzeVoiceDna } from '../services/voiceDna';

const DnaBar = ({ label, value }) => (
  <div className="flex items-center gap-4 py-3 group">
    <span className="w-32 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase flex-shrink-0 group-hover:text-slate-500 transition-colors">{label}</span>
    <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="w-10 text-right text-xs font-bold text-slate-600 flex-shrink-0">{value}%</span>
  </div>
);

const VoiceDnaView = () => {
  const { state, dispatch } = useVocalis();
  const { text, selectedLang } = state;
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = analyzeVoiceDna(text, selectedLang);
      setAnalysis(result);
      dispatch({ type: 'SET_VOICE_ANALYSIS', payload: result });
    }, 500);
    return () => clearTimeout(timer);
  }, [text, selectedLang, dispatch]);

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Voice DNA</h1>
          <p className="text-sm text-slate-500 font-light">Understand the character of your content and find the right voice.</p>
        </div>
      </div>

      {!analysis ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200/80 rounded-xl p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">No analysis available</p>
          <p className="text-xs text-slate-400">Add some text in the Create workspace to generate your Voice DNA profile.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile */}
          <div className="flex-grow bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 md:p-10">
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Content Character</h2>
              <p className="text-lg font-medium text-slate-900 mb-8 capitalize">{analysis.summary}</p>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Profile</h3>
                <DnaBar label="Warmth" value={analysis.profile.warmth} />
                <DnaBar label="Clarity" value={analysis.profile.clarity} />
                <DnaBar label="Formality" value={analysis.profile.formality} />
                <DnaBar label="Energy" value={analysis.profile.energy} />
                <DnaBar label="Expressiveness" value={analysis.profile.expressiveness} />
              </div>
            </div>
          </div>

          {/* Suggestion */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] p-6 md:p-8">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">Suggested Voice</h3>

              {analysis.suggestion ? (
                <div>
                  <p className="text-xl font-semibold text-slate-900 mb-1">{analysis.suggestion.voice.name}</p>
                  <p className="text-xs text-slate-500 mb-1">{analysis.suggestion.voice.gender} · {analysis.suggestion.voice.accent} · {analysis.suggestion.voice.style}</p>
                  <p className="text-xs text-slate-400 mb-6 italic">{analysis.suggestion.reason}</p>

                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_LANGUAGE', payload: analysis.suggestion.voice.languageCode });
                      dispatch({ type: 'SET_VOICE', payload: analysis.suggestion.voice.id });
                    }}
                    className="w-full px-5 py-3.5 bg-gradient-to-b from-slate-800 to-slate-950 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:from-slate-700 hover:to-slate-900 transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.2)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                  >
                    Use this voice
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No strong match detected for the current text and language.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceDnaView;

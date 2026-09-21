import React from 'react';
import { getVoicesForLanguage } from '../data/voices';

const VoiceSelector = ({ selectedVoice, setSelectedVoice, selectedLang, disabled = false }) => {
  const availableVoices = getVoicesForLanguage(selectedLang);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor="voice-select" className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
        Voice
      </label>
      <div className="relative">
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          disabled={disabled || !selectedLang || availableVoices.length === 0}
          className="w-full appearance-none bg-white border border-slate-200/80 rounded-lg py-3 pl-4 pr-10 text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100/50 focus:border-slate-400 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {!selectedLang ? 'Select language first' : 'Select a voice'}
          </option>
          {availableVoices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;

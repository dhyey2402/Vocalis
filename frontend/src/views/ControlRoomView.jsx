import React from 'react';
import { useVocalis } from '../context/VocalisContext';
import { AVAILABLE_VOICES } from '../data/voices';

const Slider = ({ label, description, value, onChange, leftLabel, rightLabel }) => (
  <div className="py-6 border-b border-slate-100 last:border-0">
    <div className="flex justify-between items-baseline mb-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <span className="text-xs font-semibold text-slate-600">{Math.round(value * 100)}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={Math.round(value * 100)}
      onChange={(e) => onChange(parseInt(e.target.value) / 100)}
      className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-slate-900"
    />
    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold tracking-wider uppercase">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
  </div>
);

const ControlRoomView = () => {
  const { state, dispatch } = useVocalis();
  const { voiceSettings, selectedVoice, selectedLang } = state;

  const currentVoice = AVAILABLE_VOICES.find(v => v.id === selectedVoice);

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Voice Control Room</h1>
          <p className="text-sm text-slate-500 font-light">Shape how the generated voice sounds. These settings map directly to the ElevenLabs API.</p>
        </div>
      </div>

      {!selectedVoice ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200/80 rounded-xl p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">No voice selected</p>
          <p className="text-xs text-slate-400">Choose a voice in the Create workspace to begin shaping your delivery.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Controls */}
          <div className="flex-grow bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
            <div className="p-6 md:p-10">
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Delivery Settings</h2>
              <p className="text-xs text-slate-400 mb-6">These controls are applied to the next speech generation.</p>

              <Slider
                label="Consistency"
                description="How stable and predictable the voice output will be."
                value={voiceSettings.stability}
                onChange={(val) => dispatch({ type: 'SET_VOICE_SETTINGS', payload: { stability: val } })}
                leftLabel="Expressive"
                rightLabel="Stable"
              />

              <Slider
                label="Voice Clarity"
                description="How closely the output resembles the original voice sample."
                value={voiceSettings.similarityBoost}
                onChange={(val) => dispatch({ type: 'SET_VOICE_SETTINGS', payload: { similarityBoost: val } })}
                leftLabel="Natural"
                rightLabel="Enhanced"
              />
            </div>
          </div>

          {/* Voice info */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] p-6 md:p-8">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">Current Voice</h3>
              {currentVoice ? (
                <div>
                  <p className="text-xl font-semibold text-slate-900 mb-1">{currentVoice.name}</p>
                  <p className="text-xs text-slate-500 mb-1">{currentVoice.gender} · {currentVoice.accent}</p>
                  <p className="text-xs text-slate-400">{currentVoice.style}</p>

                  <div className="border-t border-slate-100 mt-6 pt-6">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Active Settings</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Consistency</span>
                        <span className="font-semibold text-slate-600">{Math.round(voiceSettings.stability * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Voice Clarity</span>
                        <span className="font-semibold text-slate-600">{Math.round(voiceSettings.similarityBoost * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Voice not found.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ControlRoomView;

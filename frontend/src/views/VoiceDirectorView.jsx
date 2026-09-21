import React, { useState } from 'react';
import { useVocalis } from '../context/VocalisContext';
import { getVoicesForLanguage, getLanguages } from '../data/voices';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

let sectionIdCounter = 0;
const nextId = () => `section-${++sectionIdCounter}`;

const VoiceDirectorView = () => {
  const { state, dispatch } = useVocalis();
  const { text, directorSections, selectedLang } = state;
  const languages = getLanguages();

  const setSections = (sections) => {
    dispatch({ type: 'SET_DIRECTOR_SECTIONS', payload: sections });
  };

  const addSection = () => {
    setSections([
      ...directorSections,
      {
        id: nextId(),
        name: `Section ${directorSections.length + 1}`,
        text: '',
        voiceId: '',
        languageCode: selectedLang || '',
        pace: 50,
        energy: 50,
      },
    ]);
  };

  const suggestSections = () => {
    if (!text.trim()) return;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length === 0) return;

    const names = ['Introduction', 'Development', 'Elaboration', 'Detail', 'Transition', 'Expansion', 'Continuation', 'Conclusion'];
    const sections = paragraphs.map((p, i) => ({
      id: nextId(),
      name: i === 0 ? 'Introduction' : i === paragraphs.length - 1 ? 'Conclusion' : (names[i] || `Section ${i + 1}`),
      text: p.trim(),
      voiceId: '',
      languageCode: selectedLang || '',
      pace: 50,
      energy: 50,
    }));
    setSections(sections);
  };

  const updateSection = (id, field, value) => {
    setSections(directorSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id) => {
    setSections(directorSections.filter(s => s.id !== id));
  };

  const moveSection = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= directorSections.length) return;
    const updated = [...directorSections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSections(updated);
  };

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Voice Director</h1>
          <p className="text-sm text-slate-500 font-light">Divide your script into sections and direct each part individually.</p>
        </div>
      </div>

      {!text.trim() ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200/80 rounded-xl p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">No script to direct</p>
          <p className="text-xs text-slate-400">Add text in the Create workspace to begin directing your script.</p>
        </div>
      ) : (
        <div>
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button
              onClick={addSection}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-slate-800 transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.15)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Section
            </button>
            <button
              onClick={suggestSections}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-[0.1em] rounded-lg hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Suggest Sections
            </button>
          </div>

          {/* Sections */}
          {directorSections.length === 0 ? (
            <div className="bg-slate-50/50 border border-dashed border-slate-200/80 rounded-xl p-12 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-500">No sections yet. Add a section or use "Suggest Sections" to auto-divide by paragraphs.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {directorSections.map((section, index) => {
                const voices = getVoicesForLanguage(section.languageCode);
                return (
                  <div key={section.id} className="bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-6 md:p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                            className="text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none transition-colors px-0 py-1"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => moveSection(index, 1)} disabled={index === directorSections.length - 1} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteSection(section.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Text */}
                      <textarea
                        value={section.text}
                        onChange={(e) => updateSection(section.id, 'text', e.target.value)}
                        placeholder="Enter section text..."
                        className="w-full h-32 bg-slate-50 border border-slate-200/80 rounded-lg p-5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100/50 focus:border-slate-400 resize-y transition-all mb-6 shadow-sm hover:border-slate-300"
                      />

                      {/* Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase block mb-2">Language</label>
                          <select
                            value={section.languageCode}
                            onChange={(e) => {
                              updateSection(section.id, 'languageCode', e.target.value);
                              updateSection(section.id, 'voiceId', '');
                            }}
                            className="w-full appearance-none bg-slate-50 border border-slate-200/80 rounded-lg py-2.5 px-3 text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100/50 focus:border-slate-400 transition-all shadow-sm"
                          >
                            <option value="" disabled>Select</option>
                            {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase block mb-2">Voice</label>
                          <select
                            value={section.voiceId}
                            onChange={(e) => updateSection(section.id, 'voiceId', e.target.value)}
                            disabled={!section.languageCode}
                            className="w-full appearance-none bg-slate-50 border border-slate-200/80 rounded-lg py-2.5 px-3 text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100/50 focus:border-slate-400 transition-all shadow-sm disabled:opacity-50"
                          >
                            <option value="" disabled>Select</option>
                            {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase block mb-2">Pace</label>
                          <input
                            type="range" min="0" max="100" value={section.pace}
                            onChange={(e) => updateSection(section.id, 'pace', parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-slate-900"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>Slower</span><span>Faster</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase block mb-2">Energy</label>
                          <input
                            type="range" min="0" max="100" value={section.energy}
                            onChange={(e) => updateSection(section.id, 'energy', parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-200 appearance-none cursor-pointer accent-slate-900"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>Subtle</span><span>Expressive</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceDirectorView;

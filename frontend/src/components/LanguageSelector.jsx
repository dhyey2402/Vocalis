import React from 'react';
import { Globe } from 'lucide-react';
import { getLanguages } from '../data/voices';

const LanguageSelector = ({ selectedLang, setSelectedLang, disabled = false }) => {
  const languages = getLanguages();

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor="language-select" className="text-sm font-semibold text-slate-300">
        Language
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Globe className="h-4 w-4" />
        </div>
        <select
          id="language-select"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-slate-100 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>Select a language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
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

export default LanguageSelector;

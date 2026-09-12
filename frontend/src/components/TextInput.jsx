import React from 'react';
import { Trash2 } from 'lucide-react';

const TextInput = ({ text, setText, maxLength = 5000 }) => {
  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const isOverLimit = charCount > maxLength;
  const isNearLimit = charCount >= maxLength * 0.9 && !isOverLimit;
  const isWhitespaceOnly = charCount > 0 && text.trim() === '';
  const isInvalid = isOverLimit || isWhitespaceOnly;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-end">
        <label htmlFor="tts-text" className="text-sm font-semibold text-slate-300">
          Text to Speech
        </label>
        <button
          onClick={() => setText('')}
          disabled={!text}
          className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
          title="Clear text"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
      
      <div className="relative group">
        <textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to convert to speech..."
          className={`w-full h-48 bg-slate-900/50 border rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all resize-y ${
            isInvalid 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : isNearLimit
              ? 'border-amber-500/50 focus:border-amber-500 focus:ring-amber-500/20 group-hover:border-amber-500/50'
              : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 group-hover:border-white/20'
          }`}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400">
        <div className="flex gap-4">
          <span>Words: <strong className="text-slate-300 font-medium">{wordCount}</strong></span>
        </div>
        <div className={`flex gap-1 font-medium transition-colors ${
          isOverLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : ''
        }`}>
          <span>{charCount}</span>
          <span className="text-slate-500 font-normal">/</span>
          <span className="text-slate-500 font-normal">{maxLength}</span>
        </div>
      </div>
    </div>
  );
};

export default TextInput;

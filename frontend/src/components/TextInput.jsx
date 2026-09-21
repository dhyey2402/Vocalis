import React from 'react';

const TextInput = ({ text, setText, maxLength = 5000 }) => {
  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const isOverLimit = charCount > maxLength;
  const isNearLimit = charCount >= maxLength * 0.9 && !isOverLimit;
  const isWhitespaceOnly = charCount > 0 && text.trim() === '';
  const isInvalid = isOverLimit || isWhitespaceOnly;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-end">
        <label htmlFor="tts-text" className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
          Text to Speech
        </label>
        <button
          onClick={() => setText('')}
          disabled={!text}
          className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
          title="Clear text"
        >
          Clear
        </button>
      </div>
      
      <textarea
        id="tts-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter the text you want to convert to speech..."
        className={`w-full h-64 bg-white border border-slate-200/80 p-6 text-slate-800 text-base placeholder-slate-300 focus:outline-none focus:ring-4 transition-all duration-200 resize-y rounded-lg leading-relaxed shadow-sm hover:border-slate-300 ${
          isInvalid 
            ? 'border-red-300 focus:border-red-400 focus:ring-red-50' 
            : isNearLimit
            ? 'border-amber-300 focus:border-amber-400 focus:ring-amber-50'
            : 'focus:border-slate-400 focus:ring-slate-100/50'
        }`}
      />

      <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
        <span>Words: <strong className="text-slate-600">{wordCount}</strong></span>
        <span className={`transition-colors ${
          isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : ''
        }`}>
          {charCount} / {maxLength}
        </span>
      </div>
    </div>
  );
};

export default TextInput;

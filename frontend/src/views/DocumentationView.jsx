import React from 'react';

const DocumentationView = () => {
  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Documentation</h1>
          <p className="text-sm text-slate-500 font-light">Learn how to use the Vocalis Text-to-Speech application.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] p-6 md:p-10">
        <div className="max-w-3xl flex flex-col gap-12">

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Overview</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Vocalis is a web-based text-to-speech application that converts written text into natural-sounding speech.
              It supports multiple languages and voices powered by the ElevenLabs text-to-speech engine.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Getting Started</h2>
            <ol className="text-sm text-slate-600 leading-relaxed list-decimal list-inside flex flex-col gap-3">
              <li>Navigate to the <strong className="text-slate-900">Create</strong> tab.</li>
              <li>Enter or paste the text you want to convert (up to 5,000 characters).</li>
              <li>Select a <strong className="text-slate-900">language</strong> from the available options.</li>
              <li>Select a <strong className="text-slate-900">voice</strong> suited to your content.</li>
              <li>Click <strong className="text-slate-900">Generate Speech</strong> to create the audio.</li>
              <li>Use the audio player to listen, or click <strong className="text-slate-900">Download</strong> to save the MP3.</li>
            </ol>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Signature Features</h2>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Voice DNA</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Analyzes the character of your text and recommends a voice that fits your content.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Voice Director</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Divide your script into sections and assign individual voice, pace, and energy settings to each part.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Listening Intelligence</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Evaluates your text for spoken delivery quality and provides actionable improvement suggestions.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Voice Control Room</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Fine-tune voice consistency and clarity settings that are applied to the ElevenLabs generation.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Voice Timeline</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Visualize generated audio with synchronized playback, duration, and section tracking.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Supported Languages</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {['English', 'Spanish', 'French', 'German', 'Hindi', 'Gujarati', 'Marathi'].map(lang => (
                <div key={lang} className="text-sm text-slate-600 py-2 px-3 bg-slate-50 border border-slate-100 rounded-sm">{lang}</div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Limitations</h2>
            <ul className="text-sm text-slate-600 leading-relaxed list-disc list-inside flex flex-col gap-2">
              <li>Maximum text length is 5,000 characters per request.</li>
              <li>Rate limiting is enforced at 10 requests per minute.</li>
              <li>Generated audio files are temporarily stored and automatically cleaned up.</li>
              <li>Voice availability depends on the selected language.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationView;

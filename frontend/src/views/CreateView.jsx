import React from 'react';
import { useVocalis } from '../context/VocalisContext';
import TextInput from '../components/TextInput';
import LanguageSelector from '../components/LanguageSelector';
import VoiceSelector from '../components/VoiceSelector';
import GenerateButton from '../components/GenerateButton';
import AudioPlayer from '../components/AudioPlayer';
import DownloadButton from '../components/DownloadButton';
import ErrorMessage from '../components/ErrorMessage';
import { DEMO_SCRIPT } from '../data/demoScript';

const CreateView = () => {
  const { state, dispatch, handleGenerate, MAX_LENGTH } = useVocalis();
  const { text, selectedLang, selectedVoice, isGenerating, generatedAudio, formError } = state;

  const isOverLimit = text.length > MAX_LENGTH;
  const isWhitespaceOnly = text.length > 0 && text.trim() === '';

  const inputError = isOverLimit
    ? `Text exceeds the maximum allowed length of ${MAX_LENGTH} characters.`
    : isWhitespaceOnly
      ? 'Text cannot be only whitespace.'
      : null;

  const displayError = inputError || formError;

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Create</h1>
          <p className="text-sm text-slate-500 font-light">Turn your words into a voice worth hearing.</p>
        </div>
        <button
          onClick={() => {
            dispatch({ type: 'SET_TEXT', payload: DEMO_SCRIPT });
            dispatch({ type: 'SET_LANGUAGE', payload: 'en' });
            dispatch({ type: 'SET_VOICE', payload: 'en-US-1' });
          }}
          className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 rounded-md transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          Sample Project
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-10 flex flex-col gap-8">

          <section aria-label="Text Input">
            <TextInput
              text={text}
              setText={(val) => dispatch({ type: 'SET_TEXT', payload: val })}
              maxLength={MAX_LENGTH}
            />
          </section>

          <section aria-label="Configuration" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LanguageSelector
              selectedLang={selectedLang}
              setSelectedLang={(val) => dispatch({ type: 'SET_LANGUAGE', payload: val })}
              disabled={isGenerating}
            />
            <VoiceSelector
              selectedVoice={selectedVoice}
              setSelectedVoice={(val) => dispatch({ type: 'SET_VOICE', payload: val })}
              selectedLang={selectedLang}
              disabled={isGenerating}
            />
          </section>

          {displayError && <ErrorMessage error={displayError} />}

          <section aria-label="Actions" className="flex items-center">
            <GenerateButton
              onClick={handleGenerate}
              disabled={!text.trim() || isOverLimit || !selectedLang || !selectedVoice}
              isLoading={isGenerating}
            />
          </section>

        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Generated Audio</h2>
            {generatedAudio && !isGenerating && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Saved to Library
              </span>
            )}
          </div>

          <AudioPlayer
            audioUrl={generatedAudio}
            isLoading={isGenerating}
          />

          {generatedAudio && !isGenerating && (
            <div className="flex justify-end mt-4">
              <DownloadButton
                audioUrl={generatedAudio}
                disabled={isGenerating}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateView;

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import LanguageSelector from './components/LanguageSelector';
import VoiceSelector from './components/VoiceSelector';
import GenerateButton from './components/GenerateButton';
import AudioPlayer from './components/AudioPlayer';
import DownloadButton from './components/DownloadButton';
import ErrorMessage from './components/ErrorMessage';
import { Volume2 } from 'lucide-react';
import { getVoicesForLanguage } from './data/voices';
import { generateSpeech, checkHealth } from './api/client';

function App() {
  const [text, setText] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [formError, setFormError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    let intervalId;
    const verifyConnection = async () => {
      try {
        await checkHealth();
        setConnectionStatus('connected');
      } catch {
        setConnectionStatus('unavailable');
      }
    };

    verifyConnection();
    // Poll every 10 seconds to recover connection status
    intervalId = setInterval(verifyConnection, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const MAX_LENGTH = 5000;
  const isOverLimit = text.length > MAX_LENGTH;
  const isWhitespaceOnly = text.length > 0 && text.trim() === '';

  const inputError = isOverLimit 
    ? `Text exceeds the maximum allowed length of ${MAX_LENGTH} characters.`
    : isWhitespaceOnly 
      ? 'Text cannot be only whitespace.' 
      : null;

  // Handlers to clear form error on input change
  const handleTextChange = (val) => {
    setText(val);
    if (formError) setFormError(null);
  };

  const handleLangChange = (val) => {
    setSelectedLang(val);
    if (formError) setFormError(null);

    const validVoices = getVoicesForLanguage(val);
    const isVoiceValid = validVoices.some(v => v.id === selectedVoice);
    if (!isVoiceValid) {
      setSelectedVoice('');
    }
  };

  const handleVoiceChange = (val) => {
    setSelectedVoice(val);
    if (formError) setFormError(null);
  };

  const displayError = inputError || formError;

  // Handle API generation request
  const handleGenerate = async () => {
    if (!text.trim()) {
      setFormError('Please enter some text to generate speech.');
      return;
    }
    if (isOverLimit) {
      setFormError('Text exceeds the maximum allowed character limit.');
      return;
    }
    if (!selectedLang || !selectedVoice) {
      setFormError('Please select both a language and a voice.');
      return;
    }

    setFormError(null);
    setIsGenerating(true);
    setGeneratedAudio(null);

    try {
      const response = await generateSpeech({ 
        text, 
        language: selectedLang, 
        voice: selectedVoice 
      });
      
      if (response && response.audio_url) {
        setGeneratedAudio(response.audio_url);
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred while generating speech.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <Header connectionStatus={connectionStatus} />

      <main className="flex-grow py-8 sm:py-12 relative">
        {/* Background decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Bring your text to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">life</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Convert written text into natural-sounding speech instantly. Select your preferred language and voice, and let Vocalis do the rest.
            </p>
          </div>

          <div className="glass rounded-2xl p-4 sm:p-8 flex flex-col gap-8">
            <section aria-label="Text Input Area">
              <TextInput 
                text={text} 
                setText={handleTextChange} 
                maxLength={MAX_LENGTH} 
              />
            </section>

            <section aria-label="Configuration Area" className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-white/5 bg-slate-900/30">
              <LanguageSelector 
                selectedLang={selectedLang} 
                setSelectedLang={handleLangChange} 
                disabled={isGenerating}
              />
              <VoiceSelector 
                selectedVoice={selectedVoice} 
                setSelectedVoice={handleVoiceChange} 
                selectedLang={selectedLang} 
                disabled={isGenerating}
              />
            </section>

            {displayError && (
              <ErrorMessage error={displayError} />
            )}

            <section aria-label="Action Area" className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="w-full sm:w-auto">
                <GenerateButton 
                  onClick={handleGenerate} 
                  disabled={!text.trim() || isOverLimit || !selectedLang || !selectedVoice} 
                  isLoading={isGenerating} 
                />
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>High-quality neural voices</span>
              </div>
            </section>

            {(isGenerating || generatedAudio) && (
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
            )}

            <section aria-label="Generated Audio Area" className="flex flex-col gap-4">
              <AudioPlayer 
                audioUrl={generatedAudio} 
                isLoading={isGenerating} 
              />
              
              <div className="flex justify-end">
                <DownloadButton 
                  audioUrl={generatedAudio} 
                  disabled={isGenerating}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} Vocalis Text-to-Speech Application. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

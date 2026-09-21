import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getVoicesForLanguage } from '../data/voices';
import { generateSpeech, checkHealth } from '../api/client';

const VocalisContext = createContext(null);

const initialState = {
  // Core TTS
  text: '',
  selectedLang: '',
  selectedVoice: '',
  isGenerating: false,
  generatedAudio: null,
  formError: null,
  connectionStatus: 'checking',

  // Voice DNA
  voiceAnalysis: null,

  // Listening Intelligence
  listeningAnalysis: null,

  // Voice Director
  directorSections: [],

  // Voice Control Room (ElevenLabs supported params)
  voiceSettings: {
    stability: 0.5,
    similarityBoost: 0.5,
  },

  // Audio metadata (synced from AudioPlayer)
  audioMeta: {
    duration: 0,
    currentTime: 0,
    progress: 0,
    isPlaying: false,
  },

  // Active view
  activeView: 'create',

  // Selected Library Generation for Timeline
  activeGenerationMetadata: null,
};

function vocalisReducer(state, action) {
  switch (action.type) {
    case 'SET_TEXT':
      return { ...state, text: action.payload, formError: null };
    case 'SET_LANGUAGE': {
      const validVoices = getVoicesForLanguage(action.payload);
      const isVoiceValid = validVoices.some(v => v.id === state.selectedVoice);
      return {
        ...state,
        selectedLang: action.payload,
        selectedVoice: isVoiceValid ? state.selectedVoice : '',
        formError: null,
      };
    }
    case 'SET_VOICE':
      return { ...state, selectedVoice: action.payload, formError: null };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_GENERATED_AUDIO':
      return { ...state, generatedAudio: action.payload };
    case 'SET_FORM_ERROR':
      return { ...state, formError: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_VOICE_ANALYSIS':
      return { ...state, voiceAnalysis: action.payload };
    case 'SET_LISTENING_ANALYSIS':
      return { ...state, listeningAnalysis: action.payload };
    case 'SET_DIRECTOR_SECTIONS':
      return { ...state, directorSections: action.payload };
    case 'SET_VOICE_SETTINGS':
      return { ...state, voiceSettings: { ...state.voiceSettings, ...action.payload } };
    case 'SET_AUDIO_META':
      return { ...state, audioMeta: { ...state.audioMeta, ...action.payload } };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_ACTIVE_GENERATION_METADATA':
      return { ...state, activeGenerationMetadata: action.payload };
    default:
      return state;
  }
}

export function VocalisProvider({ children }) {
  const [state, dispatch] = useReducer(vocalisReducer, initialState);
  const audioRef = useRef(null);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      let newProgress = state.audioMeta.progress;
      let newDuration = state.audioMeta.duration;
      if (dur && !isNaN(dur)) {
        newDuration = dur;
        newProgress = (current / dur) * 100;
      }
      dispatch({ type: 'SET_AUDIO_META', payload: { currentTime: current, duration: newDuration, progress: newProgress } });
    }
  }, [state.audioMeta.progress, state.audioMeta.duration]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      dispatch({ type: 'SET_AUDIO_META', payload: { duration: dur } });
    }
  }, []);

  const handleEnded = useCallback(() => {
    dispatch({ type: 'SET_AUDIO_META', payload: { isPlaying: false } });
  }, []);

  const handleError = useCallback(() => {
    dispatch({ type: 'SET_AUDIO_META', payload: { isPlaying: false } });
    console.error("Audio playback error");
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (state.generatedAudio) {
        audioRef.current.src = state.generatedAudio;
        dispatch({ type: 'SET_AUDIO_META', payload: { currentTime: 0, progress: 0, isPlaying: false, duration: 0 } });
      } else {
        audioRef.current.removeAttribute('src');
      }
    }
  }, [state.generatedAudio]);

  const togglePlay = useCallback(() => {
    // We allow playing either the generatedAudio (from Create) or the activeGenerationMetadata audioUrl (from Library/Timeline)
    const currentAudioSrc = audioRef.current?.src;
    if (!audioRef.current || !currentAudioSrc) return;
    
    if (state.audioMeta.isPlaying) {
      audioRef.current.pause();
      dispatch({ type: 'SET_AUDIO_META', payload: { isPlaying: false } });
    } else {
      audioRef.current.play().then(() => {
        dispatch({ type: 'SET_AUDIO_META', payload: { isPlaying: true } });
      }).catch(e => {
        console.error("Playback error:", e);
        dispatch({ type: 'SET_AUDIO_META', payload: { isPlaying: false } });
      });
    }
  }, [state.generatedAudio, state.audioMeta.isPlaying]);

  const seek = useCallback((time) => {
    if (audioRef.current && state.generatedAudio) {
      if (!isNaN(time) && time >= 0) {
        audioRef.current.currentTime = time;
      }
    }
  }, [state.generatedAudio]);

  const setMuted = useCallback((muted) => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, []);

  // Health check
  useEffect(() => {
    let mounted = true;
    const verifyConnection = async () => {
      try {
        await checkHealth();
        if (mounted) dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      } catch (err) {
        if (!mounted) return;
        if (err.status === 429) {
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
        } else {
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'unavailable' });
        }
      }
    };
    verifyConnection();
    return () => { mounted = false; };
  }, []);

  const MAX_LENGTH = 5000;

  const handleGenerate = useCallback(async () => {
    const text = state.text;
    if (!text.trim()) {
      dispatch({ type: 'SET_FORM_ERROR', payload: 'Please enter some text to generate speech.' });
      return;
    }
    if (text.length > MAX_LENGTH) {
      dispatch({ type: 'SET_FORM_ERROR', payload: 'Text exceeds the maximum allowed character limit.' });
      return;
    }
    if (!state.selectedLang || !state.selectedVoice) {
      dispatch({ type: 'SET_FORM_ERROR', payload: 'Please select both a language and a voice.' });
      return;
    }

    dispatch({ type: 'SET_FORM_ERROR', payload: null });
    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_GENERATED_AUDIO', payload: null });

    try {
      const response = await generateSpeech({
        text,
        language: state.selectedLang,
        voice: state.selectedVoice,
        sections: state.directorSections,
        listeningData: state.listeningAnalysis,
        stability: state.voiceSettings.stability,
        similarityBoost: state.voiceSettings.similarityBoost,
      });

      if (response && response.audio_url) {
        dispatch({ type: 'SET_GENERATED_AUDIO', payload: response.audio_url });
        // After successful generation, automatically set it as the active generation for timeline
        if (response.generation) {
           dispatch({ type: 'SET_ACTIVE_GENERATION_METADATA', payload: { ...response.generation, audio_url: response.audio_url } });
        }
      }
    } catch (err) {
      dispatch({ type: 'SET_FORM_ERROR', payload: err.message || 'An error occurred while generating speech.' });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.text, state.selectedLang, state.selectedVoice, state.voiceSettings]);

  const loadGenerationForTimeline = useCallback(async (generation, audioUrl) => {
    // When a user selects an item from the library
    dispatch({ type: 'SET_ACTIVE_GENERATION_METADATA', payload: { ...generation, audio_url: audioUrl } });
    dispatch({ type: 'SET_GENERATED_AUDIO', payload: audioUrl }); // Also set it as the playing audio
  }, []);

  const value = {
    state,
    dispatch,
    handleGenerate,
    loadGenerationForTimeline,
    MAX_LENGTH,
    audioControls: {
      togglePlay,
      seek,
      setMuted
    }
  };

  return (
    <VocalisContext.Provider value={value}>
      {children}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onLoadedMetadata={handleLoadedMetadata}
        crossOrigin="use-credentials"
        className="hidden"
      />
    </VocalisContext.Provider>
  );
}

export function useVocalis() {
  const context = useContext(VocalisContext);
  if (!context) {
    throw new Error('useVocalis must be used within a VocalisProvider');
  }
  return context;
}

export default VocalisContext;

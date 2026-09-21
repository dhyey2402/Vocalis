import React, { useEffect, useState } from 'react';
import { useVocalis } from '../context/VocalisContext';
import { getLibrary, deleteGeneration, updateGenerationTitle } from '../api/client';
import { Play, Pause, Trash2, Download, Loader2, Edit2, Check, X } from 'lucide-react';
import { AVAILABLE_VOICES } from '../data/voices';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const LibraryView = () => {
  const { state, dispatch, audioControls, loadGenerationForTimeline } = useVocalis();
  const [generations, setGenerations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    const fetchLibrary = async () => {
      setIsLoading(true);
      try {
        const response = await getLibrary();
        if (response && response.success) {
          setGenerations(response.generations || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load library.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this generation?")) return;
    try {
      const response = await deleteGeneration(id);
      if (response && response.success) {
        setGenerations(prev => prev.filter(g => g.id !== id));
        // If playing this deleted audio, stop it
        if (state.generatedAudio && state.generatedAudio.includes(id)) {
          dispatch({ type: 'SET_GENERATED_AUDIO', payload: null });
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete generation.');
    }
  };

  const startEditing = (id, currentTitle) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEditing = async (id) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      alert("Title cannot be empty.");
      return;
    }
    try {
      const response = await updateGenerationTitle(id, trimmedTitle);
      if (response && response.success) {
        setGenerations(prev => prev.map(g => g.id === id ? { ...g, title: trimmedTitle } : g));
        setEditingId(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to rename generation.');
    }
  };

  const handlePlay = (id) => {
    const gen = generations.find(g => g.id === id);
    if (!gen) return;

    const audioUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/audio/${id}/stream`;
    if (state.generatedAudio === audioUrl) {
      audioControls.togglePlay();
    } else {
      // Restore generation metadata into the active workspace
      dispatch({ type: 'SET_TEXT', payload: gen.text || '' });
      dispatch({ type: 'SET_LANGUAGE', payload: gen.language || '' });
      dispatch({ type: 'SET_VOICE', payload: gen.voice || '' });
      dispatch({ type: 'SET_DIRECTOR_SECTIONS', payload: gen.sections || [] });
      if (gen.listeningData) {
        dispatch({ type: 'SET_LISTENING_ANALYSIS', payload: gen.listeningData });
      }
      
      loadGenerationForTimeline(gen, audioUrl);
      
      // The context useEffect will load it, then we need to wait a tick to play it.
      setTimeout(() => {
        audioControls.togglePlay();
      }, 50);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        <p className="text-sm font-semibold mb-2">Error loading library</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">Library</h1>
          <p className="text-sm text-slate-500 font-light">Your generated audio history.</p>
        </div>
      </div>

      {generations.length === 0 ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200/80 rounded-xl p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Your voice library is empty.</p>
          <p className="text-xs text-slate-400 mb-6">Generate your first piece of speech and it will appear here.</p>
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create' })}
            className="px-5 py-2.5 bg-gradient-to-b from-slate-800 to-slate-950 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Create Your First Voice
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {generations.map(gen => {
            const voiceInfo = AVAILABLE_VOICES.find(v => v.id === gen.voice) || { name: gen.voice };
            const audioUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/audio/${gen.id}/stream`;
            const isPlayingThis = state.generatedAudio === audioUrl && state.audioMeta.isPlaying;

            return (
              <div key={gen.id} className="group bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-grow min-w-0 w-full md:w-auto">
                  <div className="flex items-center gap-2 mb-1">
                    {editingId === gen.id ? (
                      <div className="flex items-center gap-2 flex-grow max-w-full">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing(gen.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="flex-grow px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900"
                          autoFocus
                          maxLength={255}
                        />
                        <button onClick={() => saveEditing(gen.id)} className="p-1 text-emerald-600 hover:text-emerald-700 flex-shrink-0" title="Save">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditing} className="p-1 text-slate-400 hover:text-slate-600 flex-shrink-0" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 max-w-full">
                        <h3 className="text-lg font-semibold text-slate-900 truncate" title={gen.title}>{gen.title}</h3>
                        <button onClick={() => startEditing(gen.id, gen.title)} className="md:opacity-0 md:group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-opacity flex-shrink-0" title="Rename">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="capitalize">{gen.language} · {voiceInfo.name}</span>
                    <span>{formatTime(gen.duration)}</span>
                    <span>{formatDate(gen.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handlePlay(gen.id)}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                    aria-label={isPlayingThis ? 'Pause' : 'Play'}
                  >
                    {isPlayingThis ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <a
                    href={audioUrl}
                    download={`${gen.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LibraryView;

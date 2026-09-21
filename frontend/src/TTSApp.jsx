import React, { useState } from 'react';
import { VocalisProvider, useVocalis } from './context/VocalisContext';
import CreateView from './views/CreateView';
import VoiceDnaView from './views/VoiceDnaView';
import VoiceDirectorView from './views/VoiceDirectorView';
import ListeningIntelligenceView from './views/ListeningIntelligenceView';
import ControlRoomView from './views/ControlRoomView';
import TimelineView from './views/TimelineView';
import LibraryView from './views/LibraryView';
import DocumentationView from './views/DocumentationView';
import { Menu, X, LogOut, User as UserIcon, PenLine, Layers, Dna, Activity, Clock, Sliders, BookOpen, ActivitySquare, Library as LibraryIcon } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'create', label: 'Create', icon: PenLine },
      { id: 'director', label: 'Director', icon: Layers },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'voicedna', label: 'Voice DNA', icon: Dna },
      { id: 'listening', label: 'Listening', icon: Activity },
    ],
  },
  {
    label: 'Audio',
    items: [
      { id: 'timeline', label: 'Timeline', icon: Clock },
      { id: 'controlroom', label: 'Control Room', icon: Sliders },
      { id: 'library', label: 'Library', icon: LibraryIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'documentation', label: 'Documentation', icon: BookOpen },
    ],
  },
];

const VIEW_MAP = {
  create: CreateView,
  director: VoiceDirectorView,
  voicedna: VoiceDnaView,
  listening: ListeningIntelligenceView,
  timeline: TimelineView,
  controlroom: ControlRoomView,
  library: LibraryView,
  documentation: DocumentationView,
};

function AppShell() {
  const { state, dispatch } = useVocalis();
  const { activeView, connectionStatus } = state;
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setActiveView = (viewId) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewId });
    setSidebarOpen(false);
  };

  const navigateToLanding = () => {
    window.location.hash = '';
  };

  const ActiveComponent = VIEW_MAP[activeView] || CreateView;

  return (
    <div className="h-screen bg-[#F9F9F8] flex font-sans text-slate-900 overflow-hidden selection:bg-slate-200">

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#FDFDFC] border-r border-slate-200 flex flex-col
        transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-6 py-5">
          <button onClick={navigateToLanding} className="group flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-slate-900 group-hover:text-slate-600 transition-colors" />
            <span className="text-xs font-bold tracking-[0.2em] text-slate-900 uppercase group-hover:text-slate-600 transition-colors mt-0.5">Vocalis</span>
          </button>
        </div>

        {/* Navigation groups */}
        <nav className="flex-grow overflow-y-auto py-2 px-3 custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase px-3 mb-3">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 ease-in-out flex items-center gap-3 relative ${
                      activeView === item.id
                        ? 'bg-slate-50 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {activeView === item.id && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-slate-900 rounded-r-md" />
                    )}
                    <item.icon className={`w-4 h-4 ${activeView === item.id ? 'text-slate-900' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Status & User */}
        <div className="px-4 pt-4 pb-6 border-t border-slate-200 bg-[#FDFDFC]">
          <div className="flex items-center gap-2 text-[10px] mb-4 px-2">
            <span className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
              connectionStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="font-medium tracking-[0.05em] text-slate-400 uppercase">
              {connectionStatus === 'connected' ? 'Backend connected' :
               connectionStatus === 'checking' ? 'Connecting...' : 'Backend unavailable'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-200/60 shadow-sm hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/50 text-slate-600 flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-inner">
                {user?.name ? user.name.substring(0, 2) : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-all duration-200 shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <div className="flex-grow flex flex-col min-w-0 w-full h-full overflow-y-auto">
        {/* Mobile header */}
        <header className="lg:hidden bg-[#FDFDFC] border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <ActivitySquare className="w-4 h-4 text-slate-900" />
            <span className="text-xs font-bold tracking-[0.2em] text-slate-900 uppercase">Vocalis</span>
          </div>
          <div className="w-8" /> {/* spacer */}
        </header>

        {/* Content */}
        <main className="flex-grow py-8 md:py-12 px-6 md:px-12 lg:px-16 flex flex-col relative">
          <div className="max-w-[1100px] w-full mx-auto">
            <ActiveComponent />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 md:px-12 lg:px-16 mt-auto">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between border-t border-slate-200/60 pt-6">
            <div className="flex items-center gap-1.5 opacity-50">
              <ActivitySquare className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] font-bold tracking-[0.1em] text-slate-400 uppercase">Vocalis</span>
            </div>
            <span className="text-[10px] text-slate-400">&copy; {new Date().getFullYear()} Vocalis Text-to-Speech.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function TTSApp() {
  return (
    <VocalisProvider>
      <AppShell />
    </VocalisProvider>
  );
}

export default TTSApp;

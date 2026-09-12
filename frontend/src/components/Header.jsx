import React from 'react';
import { Mic } from 'lucide-react';

const Header = ({ connectionStatus = 'checking' }) => {
  return (
    <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 p-2 rounded-xl bg-opacity-20 text-indigo-400">
            <Mic className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Vocalis
          </h1>
        </div>
        <nav>
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <li className="flex items-center gap-2">
              {connectionStatus === 'checking' && (
                <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Checking connection...
                </span>
              )}
              {connectionStatus === 'connected' && (
                <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Backend connected
                </span>
              )}
              {connectionStatus === 'unavailable' && (
                <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  Backend unavailable
                </span>
              )}
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">API</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

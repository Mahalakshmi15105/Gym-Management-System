import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-850 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10 text-slate-300 w-full">
      <div className="flex items-center gap-3">
        {/* Toggle menu button on mobile/tablet */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white p-1.5 focus:outline-none hover:bg-slate-800 rounded-lg transition-colors duration-200"
          aria-label="Open menu"
        >
          <span className="text-xl">☰</span>
        </button>
        
        <h2 className="text-sm sm:text-base font-semibold text-slate-100">
          Gym Workspace
        </h2>
        {user?.gym_id && (
          <div className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-xl border border-slate-750 font-mono hidden sm:block">
            Tenant Gym ID: {user.gym_id}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Connected
        </div>
      </div>
    </header>
  );
}

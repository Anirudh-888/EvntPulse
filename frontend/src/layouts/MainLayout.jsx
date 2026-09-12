import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Activity, Github, Heart } from 'lucide-react';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white bg-grid-pattern">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">EvntPulse</span>
            <span>— Smart Campus & Club Event Intelligence Hub</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Built for SDC Mini Startup</span>
            <span>FastAPI • React • SQLite</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { User, AppSession } from '../types';

interface HeaderProps {
  user: User;
  session: AppSession;
  onOpenProfile: () => void;
  onOpenSessions: () => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, session, onOpenProfile, onOpenSessions, isSaving }) => {
  return (
    <header className="sticky top-0 z-50 h-16 glass px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
            <i className="fa-solid fa-compass-drafting text-white text-lg"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-header text-2xl text-white uppercase tracking-tighter leading-none">Die A Log</span>
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors">Architect Studio</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-10">
        <div 
          onClick={onOpenSessions}
          className="bg-slate-900/80 border border-slate-800 px-6 py-2 rounded-full flex items-center gap-4 cursor-pointer hover:border-indigo-500 transition-all group"
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-box-archive text-[10px] text-indigo-400 group-hover:scale-110 transition-transform"></i>
            <span className="text-[11px] font-black uppercase text-slate-100 tracking-widest">{session.name}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-[10px] text-yellow-400"></i>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Syncing...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-check text-[10px] text-emerald-500"></i>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secured</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Live Engine</span>
        </div>

        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-all">{user.name}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Architect Tier</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden group-hover:border-indigo-500 transition-all shadow-xl">
            {user.picture ? (
              <img src={user.picture} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <i className="fa-solid fa-user text-sm"></i>
              </div>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
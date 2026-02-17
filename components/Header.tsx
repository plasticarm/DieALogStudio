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
    <header className="sticky top-0 z-50 h-16 glass px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
            <i className="fa-solid fa-compass-drafting text-white text-lg"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-header text-2xl text-slate-800 uppercase tracking-tighter leading-none">Die A Log</span>
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] group-hover:text-slate-600 transition-colors">Architect Studio</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-10">
        <div 
          onClick={onOpenSessions}
          className="bg-white/50 border border-black/5 px-6 py-2 rounded-full flex items-center gap-4 cursor-pointer hover:bg-white hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-box-archive text-[10px] text-slate-400 group-hover:scale-110 transition-transform"></i>
            <span className="text-[11px] font-black uppercase text-slate-800 tracking-widest">{session.name}</span>
          </div>
          <div className="h-4 w-[1px] bg-black/10"></div>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-[10px] text-yellow-600"></i>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Syncing...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-check text-[10px] text-emerald-600"></i>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secured</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[8px] font-black uppercase text-emerald-700 tracking-widest">Live Engine</span>
        </div>

        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest group-hover:text-slate-600 transition-all">{user.name}</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Architect Tier</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 overflow-hidden group-hover:border-slate-400 transition-all shadow-md">
            {user.picture ? (
              <img src={user.picture} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <i className="fa-solid fa-user text-sm"></i>
              </div>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
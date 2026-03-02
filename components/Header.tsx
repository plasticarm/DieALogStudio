import React from 'react';
import { User, AppSession } from '../types';

interface HeaderProps {
  user: User;
  session: AppSession;
  onOpenProfile: () => void;
  onOpenSessions: () => void;
  isSaving: boolean;
  isSyncingToCloud?: boolean;
  onManualSync?: () => void;
  onSyncToCloud?: () => void;
  guideEnabled?: boolean;
  onToggleGuide?: () => void;
  onBackToModeSelect?: () => void;
  onPlay?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  session, 
  onOpenProfile, 
  onOpenSessions, 
  isSaving, 
  isSyncingToCloud,
  onManualSync,
  onSyncToCloud,
  guideEnabled,
  onToggleGuide,
  onBackToModeSelect,
  onPlay
}) => {
  const storageUsage = React.useMemo(() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          total += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16 characters are 2 bytes
        }
      }
      // Standard localStorage limit is ~5MB
      // We use 5MB as a UI reference for "fullness"
      return Math.min(100, (total / (5 * 1024 * 1024)) * 100);
    } catch (e) {
      return 0;
    }
  }, [isSaving]);

  return (
    <header className="sticky top-0 z-50 h-16 glass px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {onBackToModeSelect && (
          <button 
            onClick={onBackToModeSelect}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-black/5 rounded-xl transition-all mr-2"
            title="Back to Mode Select"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        )}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-all">
            <img 
              src="https://raw.githubusercontent.com/plasticarm/DieALogStudio/main/images/DieALog_LogLogo1.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-header text-2xl text-slate-800 uppercase tracking-tighter leading-none">Die A Log</span>
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] group-hover:text-slate-600 transition-colors">Comic Studio</span>
          </div>
        </div>

        {onPlay && (
          <button
            onClick={onPlay}
            className="ml-8 px-4 py-2 bg-amber-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-amber-700 transition-all hover:scale-105 flex items-center gap-2"
          >
            <i className="fa-solid fa-gamepad"></i> Play
          </button>
        )}
      </div>

      <div className="flex-1 flex justify-center px-10">
        <div 
          className="bg-white/50 border border-black/5 px-6 py-1.5 rounded-full flex items-center gap-4 group"
        >
          <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenSessions}>
            <i className="fa-solid fa-box-archive text-[10px] text-slate-400 group-hover:scale-110 transition-transform"></i>
            <span className="text-[11px] font-black uppercase text-slate-800 tracking-widest">{session.name}</span>
          </div>
          
          <div className="h-4 w-[1px] bg-black/10"></div>
          
          <button 
            data-guide="header-sync"
            onClick={onManualSync}
            disabled={isSaving}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${
              isSaving ? 'bg-yellow-50' : 'hover:bg-emerald-50'
            }`}
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-[10px] text-yellow-600"></i>
                <span className="text-[9px] font-black text-yellow-700 uppercase tracking-widest">Saving Assets...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-[10px] text-emerald-600"></i>
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Assets Secured</span>
              </>
            )}
          </button>

          <div className="h-4 w-[1px] bg-black/10"></div>

          <button 
            onClick={onSyncToCloud}
            disabled={isSyncingToCloud}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${
              isSyncingToCloud ? 'bg-indigo-50' : 'hover:bg-indigo-50'
            }`}
            title="Sync all assets to Firebase Cloud"
          >
            {isSyncingToCloud ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-[10px] text-indigo-600"></i>
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Syncing to Cloud...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud text-[10px] text-indigo-600"></i>
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Cloud Sync</span>
              </>
            )}
          </button>

          <div className="h-4 w-[1px] bg-black/10"></div>

          <div className="flex flex-col gap-0.5 w-16" title={`Local Storage Usage: ${storageUsage.toFixed(1)}% (Browser limit is typically 5MB-10MB)`}>
            <div className="flex justify-between items-center">
              <span className="text-[6px] font-black uppercase text-slate-400 tracking-tighter">Vault Space</span>
              <span className={`text-[6px] font-black ${storageUsage > 80 ? 'text-rose-500' : 'text-slate-400'}`}>{storageUsage.toFixed(0)}%</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${storageUsage > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${storageUsage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleGuide}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${guideEnabled ? 'bg-yellow-100 border-yellow-200 text-yellow-700' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'}`}
          title={guideEnabled ? "Disable Production Guide" : "Enable Production Guide"}
        >
          <i className={`fa-solid ${guideEnabled ? 'fa-lightbulb' : 'fa-regular fa-lightbulb'}`}></i>
          <span className="text-[9px] font-black uppercase tracking-widest">{guideEnabled ? 'Guide On' : 'Guide Off'}</span>
        </button>

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
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Producer Tier</span>
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
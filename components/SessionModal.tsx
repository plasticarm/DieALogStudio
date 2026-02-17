import React, { useState } from 'react';
import { AppSession } from '../types';

interface SessionModalProps {
  sessions: AppSession[];
  activeSessionId: string;
  onLoad: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onNew: () => void;
  onImport: (file: File) => void;
  onExport: (session: AppSession) => void;
  onRename: (sessionId: string, newName: string) => void;
  onClose: () => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({ 
  sessions, activeSessionId, onLoad, onDelete, onNew, onImport, onExport, onRename, onClose 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const handleStartRename = (session: AppSession) => {
    setEditingId(session.id);
    setTempName(session.name);
  };

  const handleFinishRename = (sessionId: string) => {
    onRename(sessionId, tempName);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-[1100] modal-backdrop flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-[75vh] animate-in zoom-in-95 duration-300 border border-black/5" onClick={e => e.stopPropagation()}>
        <div className="p-10 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-slate-800 font-header text-5xl uppercase tracking-widest leading-none">Chronicles Vault</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Workspace Production Archives</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-all text-2xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6">
          <div 
            className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-slate-400 transition-all group cursor-pointer bg-slate-50"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e: any) => e.target.files?.[0] && onImport(e.target.files[0]);
              input.click();
            }}
          >
            <i className="fa-solid fa-file-import text-3xl text-slate-300 group-hover:text-slate-500"></i>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Import External Archive</span>
          </div>

          {sessions.map(session => (
            <div key={session.id} className={`p-6 rounded-3xl border transition-all flex items-center justify-between group ${
              session.id === activeSessionId ? 'border-slate-800 bg-slate-50 shadow-md' : 'border-slate-100 bg-white hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                  session.id === activeSessionId ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className="fa-solid fa-box-archive"></i>
                </div>
                <div>
                  {editingId === session.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        onBlur={() => handleFinishRename(session.id)}
                        onKeyDown={e => e.key === 'Enter' && handleFinishRename(session.id)}
                        className="bg-white border-2 border-slate-800 rounded-lg px-3 py-1 text-slate-800 font-bold text-sm outline-none shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="text-slate-800 font-black text-lg uppercase tracking-tight">{session.name}</h3>
                      <button onClick={() => handleStartRename(session)} className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                        <i className="fa-solid fa-pen text-[10px]"></i>
                      </button>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-bold">
                    Last Modified: {new Date(session.lastModified).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onExport(session)}
                  className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center shadow-sm"
                  title="Download Archive"
                >
                  <i className="fa-solid fa-download text-xs"></i>
                </button>
                {session.id !== activeSessionId && (
                  <>
                    <button 
                      onClick={() => onLoad(session.id)}
                      className="px-8 py-2.5 rounded-xl bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                    >
                      Initialize
                    </button>
                    <button 
                      onClick={() => onDelete(session.id)}
                      className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-10 border-t border-slate-100 flex justify-center shrink-0 bg-slate-50/50">
          <button 
            onClick={onNew}
            className="bg-white text-slate-800 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-slate-100 shadow-xl border border-black/5 transform active:scale-95 flex items-center gap-3"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Generate New Chronicle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
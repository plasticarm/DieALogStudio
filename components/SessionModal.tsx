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
      <div className="glass w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[70vh] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white font-header text-5xl uppercase tracking-widest">Chronicles Vault</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage Workspace Clusters</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-all text-2xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <div 
            className="border-2 border-dashed border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-500/50 transition-all group cursor-pointer"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e: any) => e.target.files?.[0] && onImport(e.target.files[0]);
              input.click();
            }}
          >
            <i className="fa-solid fa-file-import text-3xl text-slate-700 group-hover:text-indigo-400"></i>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Import External Chronicle</span>
          </div>

          {sessions.map(session => (
            <div key={session.id} className={`p-6 rounded-3xl border transition-all flex items-center justify-between group ${
              session.id === activeSessionId ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/50'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                  session.id === activeSessionId ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
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
                        className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-white text-sm outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-bold text-lg">{session.name}</h3>
                      <button onClick={() => handleStartRename(session)} className="text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                        <i className="fa-solid fa-pen text-[10px]"></i>
                      </button>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                    Last Sync: {new Date(session.lastModified).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onExport(session)}
                  className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:text-yellow-400 transition-all flex items-center justify-center"
                  title="Export Data"
                >
                  <i className="fa-solid fa-download text-xs"></i>
                </button>
                {session.id !== activeSessionId && (
                  <>
                    <button 
                      onClick={() => onLoad(session.id)}
                      className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                    >
                      Load
                    </button>
                    <button 
                      onClick={() => onDelete(session.id)}
                      className="w-10 h-10 rounded-xl bg-slate-800 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-slate-800 flex justify-center shrink-0">
          <button 
            onClick={onNew}
            className="bg-white text-slate-900 px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-slate-100 shadow-2xl transform active:scale-95 flex items-center gap-3"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Spawn New Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
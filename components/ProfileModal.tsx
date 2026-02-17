import React, { useState } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdate, onLogout, onClose }) => {
  const [localUser, setLocalUser] = useState<User>({ ...user });
  const [showKeys, setShowKeys] = useState(false);

  const handleSave = () => {
    onUpdate(localUser);
    onClose();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLocalUser({ ...localUser, picture: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] modal-backdrop flex items-center justify-center p-6" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white font-header text-4xl uppercase tracking-widest">Architect Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-all text-2xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/30 group-hover:border-indigo-500 transition-all shadow-xl bg-slate-800 flex items-center justify-center">
                {localUser.picture ? (
                  <img src={localUser.picture} className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-user text-4xl text-slate-500"></i>
                )}
              </div>
              <input type="file" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                <i className="fa-solid fa-camera text-[10px] text-white"></i>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Display Name</label>
              <input 
                type="text" 
                value={localUser.name} 
                onChange={e => setLocalUser({ ...localUser, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setShowKeys(!showKeys)}
                className="w-full flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-key text-indigo-400"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">API Credentials</span>
                </div>
                <i className={`fa-solid fa-chevron-${showKeys ? 'up' : 'down'} text-[10px] text-slate-500`}></i>
              </button>
              
              {showKeys && (
                <div className="p-4 bg-slate-950 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest block mb-1">Gemini API Key</label>
                    <input 
                      type="password" 
                      value={localUser.apiKeys?.gemini || ''} 
                      onChange={e => setLocalUser({ ...localUser, apiKeys: { ...localUser.apiKeys, gemini: e.target.value } })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="Enter API Key..."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest block mb-1">ElevenLabs Key (Voice)</label>
                    <input 
                      type="password" 
                      value={localUser.apiKeys?.elevenLabs || ''} 
                      onChange={e => setLocalUser({ ...localUser, apiKeys: { ...localUser.apiKeys, elevenLabs: e.target.value } })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="Optional..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
            >
              Update Protocol
            </button>
            <button 
              onClick={onLogout}
              className="w-full bg-transparent text-rose-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/10 transition-all"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
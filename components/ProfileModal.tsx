import React, { useState } from 'react';
import { User, ComicProfile } from '../types';
import { imageStore } from '../services/imageStore';

interface ProfileModalProps {
  user: User;
  comics: ComicProfile[];
  onUpdate: (user: User) => void;
  onLogout: () => void;
  onClose: () => void;
  hasLocalBackup?: boolean;
  onRestoreFromLocal?: () => void;
  onDeepScan?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  user, comics, onUpdate, onLogout, onClose, hasLocalBackup, onRestoreFromLocal, onDeepScan 
}) => {
  const [localUser, setLocalUser] = useState<User>({ ...user });
  const [showKeys, setShowKeys] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const allAvatars = React.useMemo(() => {
    const avatars: { url: string; name: string; series: string }[] = [];
    comics.forEach(comic => {
      comic.characters.forEach(char => {
        if (char.avatarUrl) {
          avatars.push({ url: char.avatarUrl, name: char.name, series: comic.name });
        } else if (char.imageUrl) {
          avatars.push({ url: char.imageUrl, name: char.name, series: comic.name });
        }
      });
    });
    return avatars;
  }, [comics]);

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
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-300 border border-black/5" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-slate-800 font-header text-4xl uppercase tracking-widest">Architect Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-all text-2xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-slate-300 transition-all shadow-lg bg-slate-50 flex items-center justify-center relative">
                {localUser.picture ? (
                  <img src={localUser.picture} className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-user text-4xl text-slate-200"></i>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <i className="fa-solid fa-camera text-white text-xs"></i>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Update</span>
                </div>
              </div>
              <input type="file" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>
            
            <button 
              onClick={() => setShowAvatarPicker(true)}
              className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 tracking-widest transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              Choose from Characters
            </button>
          </div>

          {showAvatarPicker && (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAvatarPicker(false)}>
              <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-800 font-header text-xl uppercase tracking-widest">Select Avatar</h3>
                  <button onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-slate-800 transition-all">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {allAvatars.length === 0 ? (
                    <div className="py-12 text-center">
                      <i className="fa-solid fa-ghost text-4xl text-slate-100 mb-4 block"></i>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No character avatars found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 pb-4">
                      {allAvatars.map((avatar, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setLocalUser({ ...localUser, picture: avatar.url });
                            setShowAvatarPicker(false);
                          }}
                          className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 border-transparent hover:border-indigo-500 transition-all"
                        >
                          <img src={avatar.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <span className="text-[7px] font-black text-white uppercase truncate">{avatar.name}</span>
                            <span className="text-[5px] font-bold text-white/70 uppercase truncate">{avatar.series}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setShowAvatarPicker(false)}
                    className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Display Name</label>
              <input 
                type="text" 
                value={localUser.name} 
                onChange={e => setLocalUser({ ...localUser, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-black/5"
              />
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setShowKeys(!showKeys)}
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-key text-slate-400"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">API Credentials</span>
                </div>
                <i className={`fa-solid fa-chevron-${showKeys ? 'up' : 'down'} text-[10px] text-slate-400`}></i>
              </button>
              
              {showKeys && (
                <div className="p-4 bg-white space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Gemini API Key</label>
                      {window.aistudio && (
                        <button 
                          onClick={async () => {
                            await window.aistudio.openSelectKey();
                            // We don't necessarily get the key back here, but we can prompt the user
                            alert("API Key selection triggered. If you selected a key, it will be used for future generations.");
                          }}
                          className="text-[8px] font-black uppercase text-amber-600 hover:text-amber-700 transition-all"
                        >
                          Select from Platform
                        </button>
                      )}
                    </div>
                    <input 
                      type="password" 
                      value={localUser.apiKeys?.gemini || ''} 
                      onChange={e => setLocalUser({ ...localUser, apiKeys: { ...(localUser.apiKeys || {}), gemini: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-slate-400"
                      placeholder="Custom Key..."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">ElevenLabs Key</label>
                    <input 
                      type="password" 
                      value={localUser.apiKeys?.elevenLabs || ''} 
                      onChange={e => setLocalUser({ ...localUser, apiKeys: { ...(localUser.apiKeys || {}), elevenLabs: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-slate-400"
                      placeholder="Optional Voice Key..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            {hasLocalBackup && onRestoreFromLocal && (
              <button 
                onClick={onRestoreFromLocal}
                className="w-full bg-amber-50 text-amber-700 border border-amber-200 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2 mb-2"
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
                Restore Local Data
              </button>
            )}
            {!hasLocalBackup && onDeepScan && (
              <button 
                onClick={onDeepScan}
                className="w-full bg-slate-50 text-slate-500 border border-slate-200 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 mb-2"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                Scan Local Vault
              </button>
            )}
            <button 
              onClick={handleSave}
              className="w-full bg-slate-800 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95"
            >
              Update Protocol
            </button>
            <button 
              onClick={onLogout}
              className="w-full bg-transparent text-rose-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 transition-all"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
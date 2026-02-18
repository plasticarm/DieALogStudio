import React, { useState, useEffect } from 'react';
import { ComicProfile, Character, Environment } from '../types';
import { generateEnvironmentDescription } from '../services/gemini';

interface TrainingCenterProps {
  editingComic: ComicProfile;
  onUpdateComic: (updated: ComicProfile) => void;
  onPreviewImage: (url: string) => void;
  globalColor: string;
  onUpdateGlobalColor: (color: string) => void;
  contrastColor: string;
}

export const TrainingCenter: React.FC<TrainingCenterProps> = ({ 
  editingComic, onUpdateComic, onPreviewImage, globalColor, onUpdateGlobalColor, contrastColor 
}) => {
  const [localComic, setLocalComic] = useState<ComicProfile>(() => JSON.parse(JSON.stringify(editingComic)));
  const [isGeneratingEnv, setIsGeneratingEnv] = useState<string | null>(null);

  useEffect(() => {
    setLocalComic(JSON.parse(JSON.stringify(editingComic)));
  }, [editingComic.id]);

  const handleSaveProtocol = (updatedState: ComicProfile) => {
    setLocalComic(updatedState);
    onUpdateComic(updatedState);
  };

  const handleColorChange = (color: string) => {
    const updated = { ...localComic, backgroundColor: color };
    setLocalComic(updated);
    onUpdateComic(updated);
  };

  const addFontToPrompt = (fontPrompt: string) => {
    const currentStyle = localComic.artStyle;
    const updated = {
      ...localComic,
      artStyle: `${currentStyle.trim()}, ${fontPrompt}`
    };
    handleSaveProtocol(updated);
  };

  const addCharacter = () => {
    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: 'New Subject',
      description: 'Physical traits and behavior...'
    };
    const updated = {
      ...localComic,
      characters: [...localComic.characters, newChar]
    };
    handleSaveProtocol(updated);
  };

  const addEnvironment = () => {
    const newEnv: Environment = {
      id: `env_${Date.now()}`,
      name: 'New Locale',
      description: 'Visual atmosphere...'
    };
    const updated = {
      ...localComic,
      environments: [...(localComic.environments || []), newEnv]
    };
    handleSaveProtocol(updated);
  };

  const handleImageUpload = (type: 'char' | 'env' | 'style', id: string | null, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      let updated = { ...localComic };
      if (type === 'char') {
        updated.characters = localComic.characters.map(c => c.id === id ? { ...c, imageUrl: dataUrl } : c);
      } else if (type === 'env') {
        updated.environments = (localComic.environments || []).map(ev => ev.id === id ? { ...ev, imageUrl: dataUrl } : ev);
      } else if (type === 'style') {
        updated.styleReferenceImageUrl = dataUrl;
      }
      handleSaveProtocol(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateEnvDesc = async (envId: string, name: string) => {
    setIsGeneratingEnv(envId);
    try {
      const desc = await generateEnvironmentDescription(name);
      const envs = (localComic.environments || []).map(ev => ev.id === envId ? { ...ev, description: desc } : ev);
      handleSaveProtocol({ ...localComic, environments: envs });
    } finally {
      setIsGeneratingEnv(null);
    }
  };

  return (
    <div className="h-full flex flex-col p-10 overflow-y-auto">
      <div className="flex justify-between items-end mb-12 border-b border-black/5 pb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
             <h2 className={`text-5xl font-header tracking-tight uppercase ${contrastColor}`}>SERIES GENOME</h2>
             <span className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm">
                SERIES {localComic.id}
             </span>
          </div>
          <p className={`${contrastColor} opacity-70 font-medium text-lg italic`}>Calibrating visual logic for <span className="font-black underline">{localComic.name}</span>.</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <label className={`text-[9px] font-black uppercase tracking-widest mb-2 ${contrastColor} opacity-60`}>Series Ambient Hue</label>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono font-bold uppercase ${contrastColor} opacity-60`}>{localComic.backgroundColor || '#dbdac8'}</span>
              <input 
                type="color" 
                value={localComic.backgroundColor || '#dbdac8'} 
                onChange={e => handleColorChange(e.target.value)} 
                className="w-14 h-10 rounded-xl border border-slate-300 cursor-pointer shadow-sm hover:scale-105 transition-transform" 
              />
            </div>
          </div>
          <button 
            onClick={() => onUpdateComic(localComic)} 
            className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition transform active:scale-95 flex items-center gap-3"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Commit DNA Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 space-y-10">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Master Aesthetic Anchor</h3>
            <div className="space-y-6">
              <div className="w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-dashed border-slate-200 relative group shadow-inner">
                {localComic.styleReferenceImageUrl ? (
                  <img src={localComic.styleReferenceImageUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(localComic.styleReferenceImageUrl!)} alt="Style" />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2 opacity-20">📸</span>
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Aesthetic Key Required</span>
                  </div>
                )}
                <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('style', null, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic uppercase tracking-wider">The engine references this data to maintain visual cohesion across episodes.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Lettering Blueprints</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Classic', prompt: 'classic 1950s comic book lettering' },
                { label: 'Retro', prompt: 'halftone dot texture, vintage typewriter' },
                { label: 'Noir', prompt: 'messy handwritten ink scratch' },
                { label: 'Pixel', prompt: '8-bit digital pixel font' },
              ].map(f => (
                <button 
                  key={f.label} 
                  onClick={() => addFontToPrompt(f.prompt)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-slate-800 transition-all shadow-sm"
                >
                  + {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-12 pb-40">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
            <h3 className="text-3xl font-header text-slate-800 border-b border-slate-50 pb-4 uppercase tracking-widest">Global Directives</h3>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Series Title</label>
                <input 
                  type="text" 
                  value={localComic.name} 
                  onChange={e => handleSaveProtocol({...localComic, name: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-black text-xl outline-none focus:ring-4 focus:ring-black/5 transition" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Core Art DNA (Art Style Prompt)</label>
                <textarea 
                  value={localComic.artStyle} 
                  onChange={e => handleSaveProtocol({...localComic, artStyle: e.target.value})} 
                  rows={6} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-800 text-sm outline-none font-medium leading-relaxed focus:ring-4 focus:ring-black/5 transition" 
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
              <h3 className="text-3xl font-header text-slate-800 uppercase tracking-widest">Characters</h3>
              <button onClick={addCharacter} className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-8 py-3 rounded-2xl hover:bg-slate-900 shadow-lg transition-all">+ Add Character</button>
            </div>
            <div className="space-y-8">
              {localComic.characters.map((char, idx) => (
                <div key={char.id} className="flex gap-8 items-start bg-slate-50/40 p-8 rounded-3xl border border-slate-100">
                  <div className="w-36 h-36 shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-lg">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(char.imageUrl!)} alt={char.name} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 p-4 text-center">
                         <span className="text-4xl mb-2 opacity-20">👤</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('char', char.id, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <input type="text" value={char.name} onChange={e => {
                      const nc = [...localComic.characters]; nc[idx].name = e.target.value; handleSaveProtocol({...localComic, characters: nc});
                    }} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-lg font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-black/5 transition shadow-sm" placeholder="Subject Name" />
                    <textarea value={char.description} onChange={e => {
                      const nc = [...localComic.characters]; nc[idx].description = e.target.value; handleSaveProtocol({...localComic, characters: nc});
                    }} rows={3} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 outline-none leading-relaxed shadow-sm focus:ring-4 focus:ring-black/5 transition" placeholder="Define visual DNA..." />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
              <h3 className="text-3xl font-header text-slate-800 uppercase tracking-widest">Environment Sets</h3>
              <button onClick={addEnvironment} className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-8 py-3 rounded-2xl hover:bg-slate-900 shadow-lg transition-all">+ Add Locale</button>
            </div>
            <div className="space-y-8">
              {(localComic.environments || []).map((env, idx) => (
                <div key={env.id} className="flex gap-8 items-start bg-slate-50/40 p-8 rounded-3xl border border-slate-100">
                  <div className="w-36 h-36 shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-lg">
                    {env.imageUrl ? (
                      <img src={env.imageUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(env.imageUrl!)} alt={env.name} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 p-4 text-center">
                         <span className="text-4xl mb-2 opacity-20">🏙️</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('env', env.id, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      <input type="text" value={env.name} onChange={e => {
                        const ne = [...(localComic.environments || [])]; ne[idx].name = e.target.value; handleSaveProtocol({...localComic, environments: ne});
                      }} className="flex-1 bg-white border border-slate-200 rounded-xl p-4 text-lg font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-black/5 transition shadow-sm" placeholder="Set Name" />
                      <button onClick={() => handleGenerateEnvDesc(env.id, env.name)} disabled={isGeneratingEnv === env.id} className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white hover:bg-slate-50 px-5 border border-slate-200 rounded-xl transition-all shadow-sm disabled:opacity-30">
                        {isGeneratingEnv === env.id ? 'Analyzing...' : 'Auto-Gen DNA'}
                      </button>
                    </div>
                    <textarea value={env.description} onChange={e => {
                      const ne = [...(localComic.environments || [])]; ne[idx].description = e.target.value; handleSaveProtocol({...localComic, environments: ne});
                    }} rows={3} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 outline-none leading-relaxed shadow-sm focus:ring-4 focus:ring-black/5 transition" placeholder="Atmosphere details..." />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
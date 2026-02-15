import React, { useState, useEffect } from 'react';
import { ComicProfile, Character, Environment } from '../types';
import { generateEnvironmentDescription } from '../services/gemini';

interface TrainingCenterProps {
  editingComic: ComicProfile;
  onUpdateComic: (updated: ComicProfile) => void;
  onPreviewImage: (url: string) => void;
  globalColor: string;
  onUpdateGlobalColor: (color: string) => void;
}

export const TrainingCenter: React.FC<TrainingCenterProps> = ({ 
  editingComic, onUpdateComic, onPreviewImage, globalColor, onUpdateGlobalColor 
}) => {
  const [localComic, setLocalComic] = useState<ComicProfile>(JSON.parse(JSON.stringify(editingComic)));
  const [isGeneratingEnv, setIsGeneratingEnv] = useState<string | null>(null);

  // Sync with prop when it changes (due to activeSeriesId change)
  useEffect(() => {
    setLocalComic(JSON.parse(JSON.stringify(editingComic)));
  }, [editingComic.id]);

  const fontSuggestions = [
    { label: 'Classic Comic', prompt: 'bold blocky comic book lettering, black outlines' },
    { label: 'Retro News', prompt: 'halftone dot texture, vintage typewriter font style' },
    { label: 'Noir Ink', prompt: 'messy handwritten ink scratch, high contrast noir lettering' },
    { label: 'Digital Pixel', prompt: '8-bit pixelated computer font, clean digital lines' },
    { label: 'Elegant Script', prompt: 'delicate cursive calligraphy, flowing ink lines' },
    { label: 'Grunge Action', prompt: 'distressed textured lettering, spray paint aesthetic' },
  ];

  const handleSave = () => {
    onUpdateComic(localComic);
    alert('Series DNA permanently updated in the database.');
  };

  const addFontToPrompt = (fontPrompt: string) => {
    const currentStyle = localComic.artStyle;
    setLocalComic({
      ...localComic,
      artStyle: `${currentStyle.trim()}, ${fontPrompt}`
    });
  };

  const addCharacter = () => {
    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: 'New Character',
      description: 'Appearance traits...'
    };
    setLocalComic({
      ...localComic,
      characters: [...localComic.characters, newChar]
    });
  };

  const addEnvironment = () => {
    const newEnv: Environment = {
      id: `env_${Date.now()}`,
      name: 'New Location',
      description: 'Describe the setting...'
    };
    setLocalComic({
      ...localComic,
      environments: [...(localComic.environments || []), newEnv]
    });
  };

  const handleImageUpload = (type: 'char' | 'env' | 'style', id: string | null, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'char') {
        const chars = localComic.characters.map(c => c.id === id ? { ...c, imageUrl: dataUrl } : c);
        setLocalComic({ ...localComic, characters: chars });
      } else if (type === 'env') {
        const envs = (localComic.environments || []).map(ev => ev.id === id ? { ...ev, imageUrl: dataUrl } : ev);
        setLocalComic({ ...localComic, environments: envs });
      } else if (type === 'style') {
        setLocalComic({ ...localComic, styleReferenceImageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateEnvDesc = async (envId: string, name: string) => {
    setIsGeneratingEnv(envId);
    try {
      const desc = await generateEnvironmentDescription(name);
      const envs = (localComic.environments || []).map(ev => ev.id === envId ? { ...ev, description: desc } : ev);
      setLocalComic({ ...localComic, environments: envs });
    } finally {
      setIsGeneratingEnv(null);
    }
  };

  return (
    <div className="h-full flex flex-col p-10 overflow-y-auto">
      <div className="flex justify-between items-end mb-12 border-b border-black/5 pb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
             <h2 className="text-5xl font-header text-slate-800 tracking-tight uppercase">DNA TRAINING</h2>
             <span className="bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm">
                Configuring: {localComic.name}
             </span>
          </div>
          <p className="text-slate-600 font-medium text-lg italic">Refining visual logic and character consistency for the {localComic.name} series.</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Environment Background</label>
            <input 
              type="color" 
              value={globalColor} 
              onChange={e => onUpdateGlobalColor(e.target.value)} 
              className="w-24 h-10 rounded-xl border border-slate-300 cursor-pointer shadow-sm" 
            />
          </div>
          <button onClick={handleSave} className="bg-brand-700 hover:bg-brand-800 text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition transform active:scale-95">Save Series DNA</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 space-y-10">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Master Style Reference</h3>
            <div className="space-y-6">
              <div className="w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-dashed border-slate-200 relative group shadow-inner">
                {localComic.styleReferenceImageUrl ? (
                  <img src={localComic.styleReferenceImageUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(localComic.styleReferenceImageUrl!)} alt="Style" />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2 opacity-20">📸</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Upload Style Key</span>
                  </div>
                )}
                <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('style', null, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">The AI uses this image as a "visual anchor" to maintain aesthetic coherence across all generated episodes.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Lettering Blueprints</h3>
            <p className="text-[11px] text-slate-400 mb-6 font-medium italic">Inject specific font and speech bubble styles into the core generation logic.</p>
            <div className="flex flex-wrap gap-2">
              {fontSuggestions.map(f => (
                <button 
                  key={f.label} 
                  onClick={() => addFontToPrompt(f.prompt)}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:text-brand-700 transition-all shadow-sm"
                >
                  + {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-12 pb-40">
          <section className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl space-y-8">
            <h3 className="text-3xl font-header text-slate-800 border-b border-slate-50 pb-4 uppercase tracking-widest">Global Directives</h3>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Series Title</label>
                <input type="text" value={localComic.name} onChange={e => setLocalComic({...localComic, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-black text-lg outline-none focus:ring-4 focus:ring-brand-50 transition shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Core Art Style prompt (Master Logic)</label>
                <textarea value={localComic.artStyle} onChange={e => setLocalComic({...localComic, artStyle: e.target.value})} rows={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-sm outline-none font-medium leading-relaxed shadow-inner focus:ring-4 focus:ring-brand-50 transition" />
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h3 className="text-3xl font-header text-slate-800 uppercase tracking-widest">Character Blueprints</h3>
              <button onClick={addCharacter} className="text-[10px] font-black uppercase tracking-widest bg-brand-700 text-white px-6 py-2.5 rounded-xl hover:bg-brand-800 shadow-lg active:scale-95 transition-all">+ Add Model</button>
            </div>
            <div className="space-y-10">
              {localComic.characters.map((char, idx) => (
                <div key={char.id} className="flex gap-8 items-start bg-slate-50/40 p-8 rounded-2xl border border-slate-100 group">
                  <div className="w-40 h-40 shrink-0 bg-white border-2 border-slate-200 rounded-2xl overflow-hidden relative shadow-lg group-hover:border-brand-400 transition-colors">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(char.imageUrl!)} alt={char.name} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                         <span className="text-4xl mb-2 opacity-10 grayscale">👤</span>
                         <span className="text-[10px] font-black uppercase tracking-widest">Identity Required</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('char', char.id, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <input type="text" value={char.name} onChange={e => {
                      const nc = [...localComic.characters]; nc[idx].name = e.target.value; setLocalComic({...localComic, characters: nc});
                    }} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-md font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-brand-50 transition shadow-sm" placeholder="Character Name" />
                    <textarea value={char.description} onChange={e => {
                      const nc = [...localComic.characters]; nc[idx].description = e.target.value; setLocalComic({...localComic, characters: nc});
                    }} rows={4} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 outline-none leading-relaxed shadow-sm focus:ring-4 focus:ring-brand-50 transition" placeholder="Define visual DNA: facial structure, key attire, typical expression, color palette..." />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h3 className="text-3xl font-header text-slate-800 uppercase tracking-widest">Environmental Sets</h3>
              <button onClick={addEnvironment} className="text-[10px] font-black uppercase tracking-widest bg-brand-700 text-white px-6 py-2.5 rounded-xl hover:bg-brand-800 shadow-lg active:scale-95 transition-all">+ Add Set</button>
            </div>
            <div className="space-y-10">
              {(localComic.environments || []).map((env, idx) => (
                <div key={env.id} className="flex gap-8 items-start bg-slate-50/40 p-8 rounded-2xl border border-slate-100 group">
                  <div className="w-40 h-40 shrink-0 bg-white border-2 border-slate-200 rounded-2xl overflow-hidden relative shadow-lg group-hover:border-brand-400 transition-colors">
                    {env.imageUrl ? (
                      <img src={env.imageUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(env.imageUrl!)} alt={env.name} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                         <span className="text-4xl mb-2 opacity-10 grayscale">🏙️</span>
                         <span className="text-[10px] font-black uppercase tracking-widest">Location Required</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('env', env.id, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      <input type="text" value={env.name} onChange={e => {
                        const ne = [...(localComic.environments || [])]; ne[idx].name = e.target.value; setLocalComic({...localComic, environments: ne});
                      }} className="flex-1 bg-white border border-slate-200 rounded-xl p-4 text-md font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-brand-50 transition shadow-sm" placeholder="Set Name" />
                      <button onClick={() => handleGenerateEnvDesc(env.id, env.name)} disabled={isGeneratingEnv === env.id} className="text-[11px] font-black uppercase tracking-widest text-brand-700 bg-white hover:bg-brand-50 px-6 border-2 border-brand-100 rounded-xl transition-all shadow-sm disabled:opacity-30">
                        {isGeneratingEnv === env.id ? 'Analyzing...' : '✨ Auto-DNA'}
                      </button>
                    </div>
                    <textarea value={env.description} onChange={e => {
                      const ne = [...(localComic.environments || [])]; ne[idx].description = e.target.value; setLocalComic({...localComic, environments: ne});
                    }} rows={4} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 outline-none leading-relaxed shadow-sm focus:ring-4 focus:ring-brand-50 transition" placeholder="Define the setting: architectural style, lighting conditions, era, atmosphere, specific background details..." />
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
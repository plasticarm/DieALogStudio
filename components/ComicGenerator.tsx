import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { ComicProfile, GeneratedPanelScript, SavedComicStrip, ArtModelType } from '../types';
import { generateComicScript, generateComicArt, removeTextFromComic } from '../services/gemini';
import { downloadImage } from '../services/utils';

interface ComicGeneratorProps {
  activeComic: ComicProfile;
  allComics: ComicProfile[];
  onSwitchComic: (id: string) => void;
  initialStrip?: SavedComicStrip | null;
  onPreviewImage: (url: string) => void;
  onSaveHistory: (strip: SavedComicStrip) => void;
  history: SavedComicStrip[];
  contrastColor: string;
}

export const ComicGenerator: React.FC<ComicGeneratorProps> = ({ 
  activeComic, allComics, onSwitchComic, initialStrip, onPreviewImage, onSaveHistory, history, contrastColor 
}) => {
  const [prompt, setPrompt] = useState(initialStrip?.prompt || '');
  const [panelCount, setPanelCount] = useState(initialStrip?.panelCount || 3);
  const [model, setModel] = useState<ArtModelType>('gemini-3-pro-image-preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [script, setScript] = useState<GeneratedPanelScript[] | null>(initialStrip?.script || null);
  const [finishedImage, setFinishedImage] = useState<string | null>(initialStrip?.finishedImageUrl || null);
  const [exportImage, setExportImage] = useState<string | null>(initialStrip?.exportImageUrl || null);
  const [activeTab, setActiveTab] = useState<'finished' | 'export' | 'history'>('finished');
  
  const [stripName, setStripName] = useState(initialStrip?.name || 'New Episode');
  const [sessionAssets, setSessionAssets] = useState<{name: string, data: string, type: 'png'}[]>([]);

  const filteredHistory = useMemo(() => history.filter(s => s.comicProfileId === activeComic.id), [history, activeComic.id]);

  const handleGenerateFullComic = async (isRandom: boolean) => {
    setIsProcessing(true); setScript(null); setFinishedImage(null); setExportImage(null);
    try {
      setStatusMessage('Scripting...');
      const s = await generateComicScript(activeComic, prompt, isRandom, panelCount);
      setScript(s);
      setStatusMessage('Rendering...');
      const img = await generateComicArt(activeComic, s, model);
      setFinishedImage(img);
    } catch (e: any) { alert(`Generation Failed: ${e.message}`); }
    finally { setIsProcessing(false); setStatusMessage(''); }
  };

  const handleRegenerateArt = async () => {
    if (!script) return;
    setIsProcessing(true);
    try {
      setStatusMessage('Re-Rendering...');
      const img = await generateComicArt(activeComic, script, model);
      setFinishedImage(img);
      setExportImage(null);
      setActiveTab('finished');
    } catch (e: any) { alert(e.message); }
    finally { setIsProcessing(false); setStatusMessage(''); }
  };

  const handleGenerateExport = async () => {
    if (!finishedImage) return;
    setIsProcessing(true); setStatusMessage('Baking clean copy...');
    try {
      const img = await removeTextFromComic(finishedImage, model);
      setExportImage(img); setActiveTab('export');
    } catch (e: any) { alert(e.message); }
    finally { setIsProcessing(false); setStatusMessage(''); }
  };

  const loadStrip = (s: SavedComicStrip) => {
    setFinishedImage(s.finishedImageUrl);
    setExportImage(s.exportImageUrl || null);
    setScript(s.script);
    setStripName(s.name);
    setPrompt(s.prompt);
    setPanelCount(s.panelCount);
    setActiveTab('finished');
  };

  const generateARId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `DIAL-${segment()}-${segment()}`;
  };

  const saveToHistory = () => {
    if (!finishedImage || !script) return;
    const newStrip: SavedComicStrip = {
      id: `strip_${Date.now()}`, 
      arTargetId: generateARId(),
      name: stripName, 
      comicProfileId: activeComic.id, 
      prompt, 
      script,
      finishedImageUrl: finishedImage, 
      exportImageUrl: exportImage || undefined, 
      timestamp: Date.now(), 
      panelCount
    };
    onSaveHistory(newStrip);
    setSessionAssets(prev => [...prev, { name: `${stripName}_master`, data: finishedImage, type: 'png' }]);
    alert('Asset saved to Library.');
  };

  const downloadSessionZip = async () => {
    if (sessionAssets.length === 0) return alert('No session assets to export.');
    const zip = new JSZip();
    sessionAssets.forEach(a => zip.file(`${a.name}.png`, a.data.split(',')[1], { base64: true }));
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `diealog_session_${Date.now()}.zip`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-xl mb-6 flex gap-6 items-end flex-wrap z-10">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Active Series</label>
          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-black text-slate-800 tracking-tight uppercase">
            {activeComic.name}
          </div>
        </div>

        <div className="w-24">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Panels</label>
          <input type="number" min="1" max="12" value={panelCount} onChange={e => setPanelCount(Number(e.target.value))} className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="w-40">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Art Engine</label>
          <select value={model} onChange={e => setModel(e.target.value as ArtModelType)} className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-400">
            <option value="gemini-2.5-flash-image">⚡ Fast Draft</option>
            <option value="gemini-3-pro-image-preview">💎 High-Res</option>
          </select>
        </div>
        <div className="flex-[3] min-w-[300px]">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Script Plot / Episode Logic</label>
          <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the scene..." className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <button onClick={() => handleGenerateFullComic(false)} disabled={isProcessing} className="bg-slate-800 text-white font-black uppercase text-xs tracking-widest px-10 py-2.5 rounded-xl hover:bg-slate-900 disabled:opacity-50 transition-all shadow-lg active:scale-95">Generate</button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="w-1/4 bg-white rounded-2xl border border-slate-300 flex flex-col overflow-hidden shadow-lg">
          <div className="flex bg-slate-50 border-b border-slate-200">
            <button onClick={() => setActiveTab('finished')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab !== 'history' ? 'bg-white text-slate-800 border-r border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Current Script</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'history' ? 'bg-white text-slate-800 border-l border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Asset Archive</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'history' ? (
              filteredHistory.length > 0 ? (
                filteredHistory.map(s => (
                  <div key={s.id} onClick={() => loadStrip(s)} className="p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-800 hover:bg-slate-50 group transition-all shadow-sm">
                    <div className="text-[10px] font-bold truncate group-hover:text-slate-900 text-slate-700 mb-2">{s.name}</div>
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg shadow-inner">
                      <img src={s.finishedImageUrl} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-slate-300 px-6">
                  <div className="text-5xl mb-4 opacity-10">🗄️</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting assets.</p>
                </div>
              )
            ) : script?.map(p => (
              <div key={p.panelNumber} className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm group relative">
                <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">PANEL {p.panelNumber}</div>
                <div className="text-[11px] text-slate-600 italic mb-3 leading-relaxed border-l-2 border-slate-300 pl-3">{p.visualDescription}</div>
                {p.dialogue.map((d, i) => (
                  <div key={i} className="text-[12px] mb-2 leading-snug last:mb-0">
                    <span className="font-black text-slate-800 uppercase text-[9px] tracking-tight mr-1">{d.character}:</span> 
                    <span className="text-slate-700 font-medium">"{d.text}"</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-300 overflow-hidden flex flex-col relative shadow-2xl">
          {(finishedImage || exportImage) && (
            <div className="px-8 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80 backdrop-blur-md z-10">
              <div className="flex gap-8">
                <button onClick={() => setActiveTab('finished')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'finished' ? 'text-slate-800 underline decoration-4 underline-offset-8' : 'text-slate-400 hover:text-slate-600'}`}>Production Master</button>
                <button onClick={() => setActiveTab('export')} disabled={!exportImage} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'export' ? 'text-slate-800 underline decoration-4 underline-offset-8' : 'text-slate-400 hover:text-slate-600'} disabled:opacity-20`}>Asset Export</button>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={stripName} 
                  onChange={e => setStripName(e.target.value)} 
                  className="bg-white border border-slate-300 px-4 py-2 text-xs rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 w-56 shadow-sm" 
                />
                <button onClick={saveToHistory} className="bg-emerald-700 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-800 shadow-md transition-all active:scale-95">Save to Vault</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-[6px] border-slate-800 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-lg font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">{statusMessage}</p>
              </div>
            )}

            {activeTab === 'finished' && finishedImage && (
              <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
                <div className="group relative w-full max-w-6xl">
                  <div className="bg-slate-900 p-3 rounded-2xl shadow-2xl relative">
                    <img 
                      src={finishedImage} 
                      className="w-full h-auto rounded-lg cursor-zoom-in transition-all group-hover:opacity-95" 
                      onClick={() => onPreviewImage(finishedImage)}
                    />
                    <div className="absolute top-8 right-8 flex gap-3">
                      <button 
                        onClick={handleRegenerateArt}
                        className="bg-slate-800 text-white text-[10px] font-black px-4 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest shadow-2xl hover:bg-slate-900"
                      >
                        🔄 Redraw Episode
                      </button>
                    </div>
                  </div>
                </div>
                {!exportImage && !isProcessing && (
                  <button onClick={handleGenerateExport} className="mt-8 bg-slate-800 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-900 transform hover:scale-105 transition-all">Extract Clean Copy</button>
                )}
              </div>
            )}
            
            {activeTab === 'export' && exportImage && (
              <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
                <div className="group relative w-full max-w-6xl">
                   <div className="bg-slate-900 p-3 rounded-2xl shadow-2xl">
                    <img 
                      src={exportImage} 
                      className="w-full h-auto rounded-lg cursor-zoom-in transition-all group-hover:opacity-95" 
                      onClick={() => onPreviewImage(exportImage)}
                    />
                  </div>
                </div>
                <div className="flex gap-6 mt-8">
                  <button onClick={() => downloadImage(exportImage, `${stripName.replace(/\s+/g, '_')}_export.png`)} className="bg-white text-slate-800 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-300 hover:bg-slate-50 shadow-xl transition-all">Download PNG</button>
                  <button onClick={downloadSessionZip} className="bg-slate-800 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-900 transition-all">📦 Export Bundle (ZIP)</button>
                </div>
              </div>
            )}
            
            {!finishedImage && !isProcessing && (
              <div className="flex-1 flex flex-col items-center justify-center pointer-events-none select-none py-20">
                <div className={`text-[200px] mb-8 opacity-5 transform -rotate-12 ${contrastColor}`}>🎬</div>
                <div className={`font-black text-7xl opacity-10 tracking-tighter uppercase ${contrastColor}`}>STUDIO STAGE</div>
                <p className={`text-sm font-bold uppercase tracking-[0.4em] mt-10 animate-pulse border-y py-4 ${contrastColor} opacity-40`}>Awaiting Script Input</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
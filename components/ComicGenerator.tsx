import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ComicProfile, GeneratedPanelScript, SavedComicStrip, ArtModelType } from '../types';
import { generateComicScript, generateComicArt, removeTextFromComic } from '../services/gemini';
import { downloadImage } from '../services/utils';

interface ComicGeneratorProps {
  activeComic: ComicProfile;
  initialStrip?: SavedComicStrip | null;
  onPreviewImage: (url: string) => void;
}

export const ComicGenerator: React.FC<ComicGeneratorProps> = ({ activeComic, initialStrip, onPreviewImage }) => {
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
  const [panelHistory, setPanelHistory] = useState<SavedComicStrip[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('diealog_history');
    if (saved) setPanelHistory(JSON.parse(saved));
  }, []);

  const filteredHistory = panelHistory.filter(s => s.comicProfileId === activeComic.id);

  const handleGenerateFullComic = async (isRandom: boolean) => {
    setIsProcessing(true); setScript(null); setFinishedImage(null); setExportImage(null);
    try {
      setStatusMessage('Scripting...');
      const s = await generateComicScript(activeComic, prompt, isRandom, panelCount);
      setScript(s);
      setStatusMessage('Rendering...');
      const img = await generateComicArt(activeComic, s, model);
      setFinishedImage(img);
    } catch (e: any) { alert(e.message); }
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

  const copyPanelToClipboard = (panel: GeneratedPanelScript) => {
    const dialogue = panel.dialogue.map(d => `${d.character}: ${d.text}`).join('\n');
    const text = `Panel ${panel.panelNumber}\nVisual: ${panel.visualDescription}\nDialogue:\n${dialogue}`;
    navigator.clipboard.writeText(text);
    alert(`Panel ${panel.panelNumber} copied!`);
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
    const updated = [newStrip, ...panelHistory];
    setPanelHistory(updated);
    localStorage.setItem('diealog_history', JSON.stringify(updated));
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
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Series Context</label>
            <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full uppercase">{activeComic.name}</span>
          </div>
          <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 select-none opacity-80 flex items-center gap-2">
            <span className="text-lg">🏷️</span> {activeComic.name}
          </div>
        </div>

        <div className="w-24">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Panels</label>
          <input type="number" min="1" max="12" value={panelCount} onChange={e => setPanelCount(Number(e.target.value))} className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="w-32">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">AI Model</label>
          <select value={model} onChange={e => setModel(e.target.value as ArtModelType)} className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-400">
            <option value="gemini-2.5-flash-image">Fast (Flash)</option>
            <option value="gemini-3-pro-image-preview">High-Res (Pro)</option>
          </select>
        </div>
        <div className="flex-[3] min-w-[300px]">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Plot Prompt / Situation</label>
          <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="What happens in this episode?" className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <button onClick={() => handleGenerateFullComic(false)} disabled={isProcessing} className="bg-brand-700 text-white font-black uppercase text-xs tracking-widest px-10 py-2.5 rounded-xl hover:bg-brand-800 disabled:opacity-50 transition-all shadow-lg active:scale-95">Produce</button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="w-1/4 bg-white rounded-2xl border border-slate-300 flex flex-col overflow-hidden shadow-lg">
          <div className="flex bg-slate-50 border-b border-slate-200">
            <button onClick={() => setActiveTab('finished')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab !== 'history' ? 'bg-white text-brand-700 border-r border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Current Script</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'history' ? 'bg-white text-brand-700 border-l border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Asset History</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'history' ? (
              filteredHistory.length > 0 ? (
                filteredHistory.map(s => (
                  <div key={s.id} onClick={() => loadStrip(s)} className="p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-brand-500 hover:bg-brand-50 group transition-all shadow-sm">
                    <div className="text-[10px] font-bold truncate group-hover:text-brand-700 text-slate-700 mb-2">{s.name}</div>
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg shadow-inner">
                      <img src={s.finishedImageUrl} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 mt-2 uppercase tracking-tighter flex justify-between items-center">
                      <span>ID: {s.arTargetId}</span>
                      <span className="bg-slate-200 px-1 rounded">{new Date(s.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-slate-300 px-6">
                  <div className="text-5xl mb-4 opacity-10">🗄️</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">No saved assets for this series yet.</p>
                </div>
              )
            ) : script?.map(p => (
              <div key={p.panelNumber} className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                  <div className="text-[10px] font-black text-brand-700 uppercase tracking-widest">PANEL {p.panelNumber}</div>
                  <button onClick={() => copyPanelToClipboard(p)} className="text-[9px] font-black uppercase text-slate-400 hover:text-brand-700 transition">Copy</button>
                </div>
                <div className="text-[11px] text-slate-600 italic mb-3 leading-relaxed border-l-2 border-brand-200 pl-3">{p.visualDescription}</div>
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
                <button onClick={() => setActiveTab('finished')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'finished' ? 'text-brand-700 underline decoration-4 underline-offset-8' : 'text-slate-400 hover:text-slate-600'}`}>Master Copy</button>
                <button onClick={() => setActiveTab('export')} disabled={!exportImage} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'export' ? 'text-brand-700 underline decoration-4 underline-offset-8' : 'text-slate-400 hover:text-slate-600'} disabled:opacity-20`}>Export Copy</button>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={stripName} 
                  onChange={e => setStripName(e.target.value)} 
                  className="bg-white border border-slate-300 px-4 py-2 text-xs rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 w-56 shadow-sm" 
                />
                <button onClick={saveToHistory} className="bg-emerald-700 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-800 shadow-md transition-all active:scale-95">Save to Series</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-[6px] border-brand-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-lg font-black text-brand-700 uppercase tracking-[0.3em] animate-pulse">{statusMessage}</p>
              </div>
            )}

            {(finishedImage || exportImage) && (
              <div className="w-full text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <h2 className="text-4xl font-comic text-slate-800 tracking-widest uppercase mb-1">{stripName}</h2>
                <div className="h-1 w-24 bg-brand-600 mx-auto rounded-full opacity-40"></div>
              </div>
            )}

            {activeTab === 'finished' && finishedImage && (
              <div className="w-full space-y-12 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
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
                        className="bg-brand-600 text-white text-[10px] font-black px-4 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest shadow-2xl hover:bg-brand-700"
                      >
                        🔄 Re-Draw Scene
                      </button>
                    </div>
                  </div>
                </div>
                {!exportImage && !isProcessing && (
                  <button onClick={handleGenerateExport} className="bg-brand-700 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-800 transform hover:scale-105 active:scale-95 transition-all">Bake Export Assets (Dialogue Removal)</button>
                )}
              </div>
            )}
            
            {activeTab === 'export' && exportImage && (
              <div className="w-full space-y-12 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
                <div className="group relative w-full max-w-6xl">
                   <div className="bg-slate-900 p-3 rounded-2xl shadow-2xl">
                    <img 
                      src={exportImage} 
                      className="w-full h-auto rounded-lg cursor-zoom-in transition-all group-hover:opacity-95" 
                      onClick={() => onPreviewImage(exportImage)}
                    />
                  </div>
                  <div className="absolute top-8 right-8 bg-brand-600 text-white text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest shadow-2xl">Clean Matte Asset</div>
                </div>
                <div className="flex gap-6 w-full justify-center">
                  <button onClick={() => downloadImage(exportImage, `${stripName.replace(/\s+/g, '_')}_export.png`)} className="bg-white text-slate-800 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-300 hover:bg-slate-50 transition shadow-xl">Download Matte</button>
                  <button onClick={downloadSessionZip} className="bg-brand-700 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-800 transition transform hover:scale-105">📦 Export Bundle (ZIP)</button>
                  <button onClick={handleGenerateExport} className="bg-slate-600 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-700 transition">🔄 Retry Bake</button>
                </div>
              </div>
            )}
            
            {!finishedImage && !isProcessing && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-200 pointer-events-none select-none py-20">
                <div className="text-[200px] mb-8 opacity-5 transform -rotate-12">🎬</div>
                <div className="font-black text-7xl opacity-10 tracking-tighter uppercase text-slate-900">STUDIO STAGE</div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.4em] mt-10 animate-pulse border-y border-slate-100 py-4">Awaiting Production Input</p>
                <div className="mt-12 text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-4">
                   <span>{activeComic.name}</span>
                   <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
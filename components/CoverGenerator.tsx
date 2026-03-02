import React, { useState } from 'react';
import { ComicBook, ComicProfile, ArtModelType } from '../types';
import { generateComicArt } from '../services/gemini';
import { downscaleImage } from '../utils/imageUtils';
import { imageStore } from '../services/imageStore';
import { CachedImage } from './CachedImage';

interface CoverGeneratorProps {
  book: ComicBook;
  activeComic: ComicProfile;
  onSaveCover: (imageUrl: string) => void;
  onBack: () => void;
}

export const CoverGenerator: React.FC<CoverGeneratorProps> = ({ book, activeComic, onSaveCover, onBack }) => {
  const [prompt, setPrompt] = useState(`Grand cover illustration for the series: ${activeComic.name}`);
  const [model, setModel] = useState<ArtModelType>('gemini-3-pro-image-preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewCover, setPreviewCover] = useState<string | null>(book.coverImageUrl || null);

  const handleGenerateCover = async () => {
    setIsProcessing(true);
    try {
      const mockScript = [{
        panelNumber: 1,
        visualDescription: `Main cover illustration: ${prompt}. Cinematic, epic composition, high detail, high resolution production quality. Including the branding and tone of the series: ${activeComic.name}.`,
        dialogue: []
      }];
      const rawImg = await generateComicArt(activeComic, mockScript, model);
      const img = await downscaleImage(rawImg, 1024, 0.8);
      const vaultedImg = await imageStore.vaultify(img);
      setPreviewCover(vaultedImg);
    } catch (e: any) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-slate-600 font-black uppercase text-[10px] tracking-widest hover:underline">← Back to Binder</button>
          <h2 className="text-2xl font-comic text-slate-800 tracking-widest uppercase">Cover Art Studio</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-slate-200 space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Series</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-slate-800 uppercase tracking-tight">
                {activeComic.name}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Cover Directives</label>
              <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl p-4 font-medium text-sm h-32 outline-none focus:ring-2 focus:ring-slate-400 transition"
                placeholder="Describe the grand cover art..."
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Art Model</label>
              <select value={model} onChange={e => setModel(e.target.value as ArtModelType)} className="w-full bg-slate-100 border border-slate-300 rounded-xl p-3 font-bold">
                <option value="gemini-2.5-flash-image">⚡ Fast Render</option>
                <option value="gemini-3-pro-image-preview">💎 Pro Render</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button 
                data-guide="cover-generate"
                onClick={handleGenerateCover}
                disabled={isProcessing}
                className="flex-1 bg-slate-800 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-slate-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {isProcessing ? 'Rendering...' : '🎨 Generate Cover'}
              </button>
              <label className="bg-slate-100 text-slate-600 font-black uppercase px-6 rounded-xl shadow-md hover:bg-slate-200 transition flex items-center justify-center cursor-pointer">
                <i className="fa-solid fa-upload"></i>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        const url = await downscaleImage(ev.target?.result as string, 1024, 0.8);
                        const vaultedUrl = await imageStore.vaultify(url);
                        setPreviewCover(vaultedUrl);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
            </div>
          </div>

          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-8 relative">
            {previewCover ? (
              <div className="w-full aspect-[3/4] bg-white rounded-2xl shadow-2xl border-[10px] border-white overflow-hidden relative group">
                <CachedImage src={previewCover} className="w-full h-full object-cover" />
                <button 
                  onClick={() => onSaveCover(previewCover)}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition"
                >
                  ✓ Commit Cover
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-200">
                <span className="text-9xl mb-4 opacity-10">🖼️</span>
                <p className="font-black uppercase tracking-widest">Awaiting Studio Output</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
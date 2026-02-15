import React, { useState } from 'react';
import { ComicBook, ComicProfile, ArtModelType } from '../types';
import { generateComicArt } from '../services/gemini';

interface CoverGeneratorProps {
  book: ComicBook;
  comics: ComicProfile[];
  onSaveCover: (imageUrl: string) => void;
  onBack: () => void;
}

export const CoverGenerator: React.FC<CoverGeneratorProps> = ({ book, comics, onSaveCover, onBack }) => {
  const [selectedComicId, setSelectedComicId] = useState(comics[0]?.id || '');
  const [prompt, setPrompt] = useState(`Grand cover for ${book.title}`);
  const [model, setModel] = useState<ArtModelType>('gemini-3-pro-image-preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewCover, setPreviewCover] = useState<string | null>(book.coverImageUrl || null);

  const selectedComic = comics.find(c => c.id === selectedComicId);

  const handleGenerateCover = async () => {
    if (!selectedComic) return;
    setIsProcessing(true);
    try {
      // For cover, we use a single "panel" script concept
      const mockScript = [{
        panelNumber: 1,
        visualDescription: `Main cover illustration: ${prompt}. Cinematic, epic composition, high detail. Title text: "${book.title}".`,
        dialogue: []
      }];
      const img = await generateComicArt(selectedComic, mockScript, model);
      setPreviewCover(img);
    } catch (e: any) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-slate-600 font-black uppercase text-[10px] tracking-widest hover:underline">← Back to Editor</button>
          <h2 className="text-2xl font-comic text-slate-800 tracking-widest uppercase">Cover Art Studio</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-slate-200 space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Series Style</label>
              <select value={selectedComicId} onChange={(e) => setSelectedComicId(e.target.value)} className="w-full bg-slate-100 border border-slate-300 rounded-xl p-3 font-bold">
                {comics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Cover Description</label>
              <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl p-4 font-medium text-sm h-32 outline-none focus:ring-2 focus:ring-slate-400 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Art Model</label>
              <select value={model} onChange={e => setModel(e.target.value as ArtModelType)} className="w-full bg-slate-100 border border-slate-300 rounded-xl p-3 font-bold">
                <option value="gemini-2.5-flash-image">Fast</option>
                <option value="gemini-3-pro-image-preview">Pro</option>
              </select>
            </div>
            <button 
              onClick={handleGenerateCover}
              disabled={isProcessing}
              className="w-full bg-slate-800 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-slate-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isProcessing ? 'Painting...' : '🎨 Render Cover'}
            </button>
          </div>

          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-8 relative">
            {previewCover ? (
              <div className="w-full aspect-[3/4] bg-white rounded-2xl shadow-2xl border-[10px] border-white overflow-hidden relative group">
                <img src={previewCover} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity flex flex-col items-center justify-center text-white pointer-events-none">
                  <span className="font-comic text-5xl text-center px-4 drop-shadow-xl">{book.title}</span>
                </div>
                <button 
                  onClick={() => onSaveCover(previewCover)}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition"
                >
                  ✓ Use This Cover
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-200">
                <span className="text-9xl mb-4 opacity-10">🖼️</span>
                <p className="font-black uppercase tracking-widest">Awaiting Render</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

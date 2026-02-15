import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { ComicBook, SavedComicStrip } from '../types';

interface ComicBookEditorProps {
  book: ComicBook;
  onUpdateBook: (book: ComicBook) => void;
  onEditPage: (strip: SavedComicStrip) => void;
  onPreviewImage: (url: string) => void;
  onLaunchReader: (pages: SavedComicStrip[]) => void;
  onManageCover: () => void;
  onOpenSettings: () => void;
  activeSeriesId: string | null;
}

export const ComicBookEditor: React.FC<ComicBookEditorProps> = ({ 
  book, onUpdateBook, onEditPage, onPreviewImage, onLaunchReader, onManageCover, onOpenSettings, activeSeriesId
}) => {
  const [history, setHistory] = useState<SavedComicStrip[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'master' | 'export'>('master');

  useEffect(() => {
    const h = localStorage.getItem('diealog_history');
    if (h) setHistory(JSON.parse(h));
  }, []);

  // Filter history to only show assets for the currently active series
  const filteredHistory = history.filter(s => s.comicProfileId === activeSeriesId);

  const saveBook = (pages: string[]) => {
    onUpdateBook({ ...book, pages });
  };

  const addToBook = (id: string) => {
    if (book.pages.includes(id)) return;
    saveBook([...book.pages, id]);
  };

  const removePage = (id: string) => {
    saveBook(book.pages.filter(p => p !== id));
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const items = [...book.pages];
    const draggedItem = items[dragIndex];
    items.splice(dragIndex, 1);
    items.splice(index, 0, draggedItem);
    setDragIndex(index);
    saveBook(items);
  };

  const onDragEnd = () => {
    setDragIndex(null);
  };

  const getStrip = (id: string) => history.find(s => s.id === id);

  const handleLaunchReader = () => {
    const pages = book.pages.map(id => getStrip(id)).filter((s): s is SavedComicStrip => !!s);
    if (pages.length === 0 && book.externalPageUrls.length === 0) return alert('Add pages to the volume first!');
    onLaunchReader(pages);
  };

  const handleExportPDF = async (mode: 'master' | 'export') => {
    if (book.pages.length === 0 && book.externalPageUrls.length === 0) return alert('Add some pages to export.');
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: book.width > book.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [book.width, book.height]
      });

      const addMetadata = (pageNum: number, total: number) => {
        if (book.logoUrl) {
          const logoSize = 40;
          doc.addImage(book.logoUrl, 'PNG', 20, 20, logoSize, logoSize);
        }
        if (book.showPageNumbers) {
          doc.setFontSize(12);
          const text = `Page ${pageNum} of ${total}`;
          const y = book.pageNumberPosition === 'top' ? 30 : book.height - 30;
          doc.text(text, book.width - 80, y);
        }
      };

      // Cover Page
      if (book.coverImageUrl) {
        doc.addImage(book.coverImageUrl, 'PNG', 0, 0, book.width, book.height);
        doc.addPage();
      }

      const totalItems = book.pages.length + book.externalPageUrls.length;

      // Render Comic Strips
      for (let i = 0; i < book.pages.length; i++) {
        const strip = getStrip(book.pages[i]);
        if (strip) {
          const imgUrl = (mode === 'export' && strip.exportImageUrl) ? strip.exportImageUrl : strip.finishedImageUrl;
          doc.addImage(imgUrl, 'PNG', 0, 0, book.width, book.height);
          addMetadata(i + 1, totalItems);
          if (i < totalItems - 1) doc.addPage();
        }
      }

      // Render External URLs
      for (let i = 0; i < book.externalPageUrls.length; i++) {
        const url = book.externalPageUrls[i];
        doc.addImage(url, 'JPEG', 0, 0, book.width, book.height);
        addMetadata(book.pages.length + i + 1, totalItems);
        if (i < book.externalPageUrls.length - 1) doc.addPage();
      }

      doc.save(`${book.title.replace(/\s+/g, '_')}_${mode}.pdf`);
    } catch (e) {
      alert('PDF generation failed. Some assets may not be CORS accessible.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      book.pages.forEach((id, index) => {
        const strip = getStrip(id);
        if (strip) {
          zip.file(`page_${index + 1}_master.png`, strip.finishedImageUrl.split(',')[1], { base64: true });
          if (strip.exportImageUrl) zip.file(`page_${index + 1}_export.png`, strip.exportImageUrl.split(',')[1], { base64: true });
        }
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${book.title.replace(/\s+/g, '_')}_assets.zip`;
      link.click();
    } catch (e) { alert('ZIP generation failed.'); }
    finally { setIsExporting(false); }
  };

  return (
    <div className="h-full flex gap-10 p-10 overflow-hidden">
      {/* Page Library (Scoped to Active Series) */}
      <div className="w-1/4 bg-slate-800 rounded-[2.5rem] border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-700 flex flex-col">
          <span className="font-black text-slate-100 uppercase tracking-[0.2em] text-[10px] mb-1">Production Vault</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase">Assets for: {book.title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredHistory.length === 0 && (
            <div className="text-center py-20 px-4">
              <div className="text-5xl mb-4 opacity-5 grayscale">📑</div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">No produced assets found for this series. Head to the Studio to render scenes.</p>
            </div>
          )}
          {filteredHistory.map(s => (
            <div key={s.id} className="p-4 bg-slate-700/40 border border-slate-600/50 rounded-2xl group relative shadow-lg hover:border-brand-500 transition-all">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-4 shadow-inner">
                <img 
                  src={s.finishedImageUrl} 
                  className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                  onClick={() => onPreviewImage(s.finishedImageUrl)}
                  alt={s.name}
                />
              </div>
              <div className="text-[11px] font-black truncate text-slate-100 uppercase mb-4 tracking-tight px-1">{s.name}</div>
              <button 
                onClick={() => addToBook(s.id)} 
                disabled={book.pages.includes(s.id)}
                className={`w-full text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md ${book.pages.includes(s.id) ? 'bg-slate-800 cursor-not-allowed text-slate-600 border border-slate-700' : 'bg-brand-600 hover:bg-brand-700 active:scale-95'}`}
              >
                {book.pages.includes(s.id) ? 'Bound to Volume' : 'Add to Index'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Book Assembly */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-300 flex flex-col overflow-hidden shadow-2xl relative">
        <div className="px-8 py-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <input 
                type="text" 
                value={book.title} 
                onChange={e => onUpdateBook({...book, title: e.target.value})}
                className="bg-transparent border-none text-white font-comic text-3xl outline-none focus:ring-0 w-80 uppercase tracking-widest placeholder:text-slate-600"
                placeholder="Volume Title..."
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{book.pages.length} Registered Pages</span>
              </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-700"></div>
            <button 
              onClick={onManageCover}
              className={`h-14 w-14 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all hover:scale-110 active:scale-90 ${book.coverImageUrl ? 'border-brand-500' : 'border-dashed border-slate-600 bg-slate-700 flex items-center justify-center'}`}
              title="Change Cover Art"
            >
              {book.coverImageUrl ? <img src={book.coverImageUrl} className="w-full h-full object-cover" alt="Cover" /> : <span className="text-slate-500 text-xl">🖼️</span>}
            </button>
            <button 
              onClick={onOpenSettings}
              className="h-14 w-14 bg-slate-700 rounded-2xl flex items-center justify-center text-white border border-slate-600 hover:bg-slate-600 transition-all hover:rotate-90 shadow-2xl"
              title="Volume Blueprint Settings"
            >
              ⚙️
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
              <button 
                onClick={() => setViewMode('master')} 
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'master' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Production
              </button>
              <button 
                onClick={() => setViewMode('export')} 
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'export' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Export
              </button>
            </div>
            <button onClick={handleLaunchReader} className="bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl hover:bg-brand-700 shadow-2xl transition-all active:scale-95">Open Reader 📖</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-slate-50/30">
          {book.pages.length === 0 && book.externalPageUrls.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-200 py-20 pointer-events-none">
              <div className="text-[160px] mb-8 opacity-5 transform rotate-6">📚</div>
              <p className="font-black text-4xl uppercase tracking-[0.4em] opacity-10 text-slate-900">Volume Sequencer</p>
              <p className="text-[11px] text-slate-400 font-bold mt-6 uppercase tracking-[0.2em] border-t border-slate-100 pt-4">Drag registered assets into the workspace</p>
            </div>
          )}
          {book.pages.map((id, index) => {
            const strip = getStrip(id);
            if (!strip) return null;
            const currentImg = (viewMode === 'export' && strip.exportImageUrl) ? strip.exportImageUrl : strip.finishedImageUrl;
            return (
              <div 
                key={id}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                className={`bg-white p-6 rounded-[2rem] border-2 transition-all cursor-move flex gap-10 group shadow-lg ${dragIndex === index ? 'border-brand-600 scale-95 opacity-50' : 'border-slate-100 hover:border-brand-300 hover:shadow-2xl'}`}
              >
                <div className="w-16 h-16 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-3xl font-black text-slate-800 shadow-inner shrink-0 text-3xl font-header">
                  {index + 1}
                </div>
                <div className="w-80 aspect-[16/9] shrink-0 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-slate-50">
                  <img 
                    src={currentImg} 
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-110" 
                    onClick={() => onPreviewImage(currentImg)}
                    alt={`Page ${index + 1}`}
                  />
                  {viewMode === 'export' && !strip.exportImageUrl && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border-4 border-rose-500/30">
                       <span className="text-2xl mb-2">⚠️</span>
                      <p className="text-white text-[10px] font-black uppercase tracking-widest leading-relaxed">Clean Asset Missing</p>
                      <button onClick={(e) => { e.stopPropagation(); onEditPage(strip); }} className="mt-3 bg-brand-600 text-[9px] px-3 py-1 rounded-lg uppercase font-black text-white hover:bg-brand-700 transition">Go to Studio</button>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-header text-4xl text-slate-800 uppercase tracking-tight">{strip.name}</h4>
                      <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{strip.arTargetId}</span>
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium line-clamp-3 italic leading-relaxed border-l-4 border-slate-100 pl-4 py-1">"{strip.prompt}"</p>
                  </div>
                  <div className="flex gap-8">
                    <button onClick={() => onEditPage(strip)} className="text-[11px] font-black uppercase text-brand-600 hover:text-brand-800 tracking-widest hover:underline decoration-4 underline-offset-4">Studio View</button>
                    <button onClick={() => removePage(id)} className="text-[11px] font-black uppercase text-rose-500 hover:text-rose-700 tracking-widest hover:underline decoration-4 underline-offset-4">Detach Page</button>
                  </div>
                </div>
                <div className="text-slate-200 self-center px-6 text-5xl font-black opacity-0 group-hover:opacity-100 transition-opacity select-none cursor-grab active:cursor-grabbing">⠿</div>
              </div>
            );
          })}
          {book.externalPageUrls.map((url, idx) => (
            <div key={`ext_${idx}`} className="bg-slate-50/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex gap-10 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="w-16 h-16 flex items-center justify-center bg-white border border-slate-100 rounded-3xl font-black text-slate-300 shrink-0 text-3xl font-header">
                {book.pages.length + idx + 1}
              </div>
              <div className="w-80 aspect-[16/9] bg-slate-200 rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center text-slate-400 font-black text-[10px] uppercase border-2 border-white">
                <span className="text-4xl mb-2">🔗</span>
                External Link Asset
              </div>
              <div className="flex-1 flex flex-col justify-center">
                 <h4 className="font-header text-4xl text-slate-400 uppercase tracking-widest mb-1">External Resource {idx + 1}</h4>
                 <p className="text-[10px] font-mono text-slate-400 truncate bg-white p-2 rounded-lg border border-slate-100">{url}</p>
              </div>
            </div>
          ))}
        </div>
        
        {book.pages.length > 0 && (
          <div className="p-10 border-t border-slate-200 bg-white flex justify-center gap-8 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.02)] z-10">
            <div className="flex gap-3 bg-slate-100 p-2 rounded-[2rem] shadow-inner border border-slate-200">
              <button 
                onClick={() => handleExportPDF('master')}
                disabled={isExporting}
                className="bg-slate-800 text-slate-50 font-black uppercase text-[11px] tracking-widest px-10 py-4 rounded-2xl shadow-xl hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-4 disabled:opacity-50"
              >
                <span>📄 Full Render (PDF)</span>
              </button>
              <button 
                onClick={() => handleExportPDF('export')}
                disabled={isExporting}
                className="bg-white text-slate-800 border border-slate-300 font-black uppercase text-[11px] tracking-widest px-10 py-4 rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-4 disabled:opacity-50"
              >
                <span>📄 Matte Pack (PDF)</span>
              </button>
            </div>
            <button 
              onClick={handleExportZIP}
              disabled={isExporting}
              className="bg-brand-700 text-white font-black uppercase text-[11px] tracking-widest px-12 py-4 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-brand-800 transition-all active:scale-95 flex items-center gap-4 disabled:opacity-50"
            >
              <span>📦 Production Bundle (ZIP)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
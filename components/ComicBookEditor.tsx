import React, { useState } from 'react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { ComicBook, SavedComicStrip } from '../types';
import { CachedImage } from './CachedImage';

interface ComicBookEditorProps {
  book: ComicBook;
  onUpdateBook: (book: ComicBook) => void;
  onEditPage: (strip: SavedComicStrip) => void;
  onPreviewImage: (url: string) => void;
  onLaunchReader: (pages: SavedComicStrip[], mode: 'finished' | 'clean') => void;
  onManageCover: () => void;
  onOpenSettings: () => void;
  activeSeriesId: string | null;
  history: SavedComicStrip[];
  onDeleteHistoryItem: (id: string) => void;
  contrastColor: string;
  onAdvanceGuide?: (step: number) => void;
}

export const ComicBookEditor: React.FC<ComicBookEditorProps> = ({ 
  book, onUpdateBook, onEditPage, onPreviewImage, onLaunchReader, onManageCover, onOpenSettings, activeSeriesId, history, onDeleteHistoryItem, contrastColor, onAdvanceGuide
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [viewMode, setViewMode] = useState<'finished' | 'clean'>('finished');

  const filteredHistory = history.filter(s => s.comicProfileId === activeSeriesId);

  const saveBook = (pages: string[]) => {
    onUpdateBook({ ...book, pages });
  };

  const addToBook = (id: string) => {
    if (book.pages.includes(id)) return;
    saveBook([...book.pages, id]);
    onAdvanceGuide?.(8);
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
    let pages = book.pages.map(id => getStrip(id)).filter((s): s is SavedComicStrip => !!s);
    
    if (book.coverImageUrl) {
      const coverStrip: SavedComicStrip = {
        id: 'cover-page',
        arTargetId: '',
        name: 'Cover Page',
        comicProfileId: activeSeriesId || '',
        prompt: 'Series Cover',
        script: [],
        finishedImageUrl: book.coverImageUrl,
        timestamp: book.timestamp,
        panelCount: 1
      };
      pages = [coverStrip, ...pages];
    }

    if (pages.length === 0 && book.externalPageUrls.length === 0) return alert('Bind pages to the volume first!');
    onLaunchReader(pages, viewMode);
  };

  const handleExportZip = async () => {
    if (book.pages.length === 0) return alert('No pages to export.');
    setIsZipping(true);
    onAdvanceGuide?.(12);
    try {
      const zip = new JSZip();
      book.pages.forEach((id, index) => {
        const strip = getStrip(id);
        if (strip) {
          const imgUrl = (viewMode === 'clean' && strip.exportImageUrl) ? strip.exportImageUrl : strip.finishedImageUrl;
          const base64Data = imgUrl.split(',')[1];
          const fileName = `${(index + 1).toString().padStart(3, '0')}_${strip.name.replace(/\s+/g, '_')}.png`;
          zip.file(fileName, base64Data, { base64: true });
        }
      });

      if (book.coverImageUrl) {
        const coverBase64 = book.coverImageUrl.split(',')[1];
        zip.file('000_COVER.png', coverBase64, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${book.title.replace(/\s+/g, '_')}_assets.zip`;
      link.click();
    } catch (e) {
      alert('ZIP generation failed.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleExportPDF = async (mode: 'finished' | 'clean') => {
    if (book.pages.length === 0 && book.externalPageUrls.length === 0) return alert('Add some pages to export.');
    setIsExporting(true);
    onAdvanceGuide?.(11);
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

      if (book.coverImageUrl) {
        doc.addImage(book.coverImageUrl, 'PNG', 0, 0, book.width, book.height);
        doc.addPage();
      }

      const totalItems = book.pages.length + book.externalPageUrls.length;

      for (let i = 0; i < book.pages.length; i++) {
        const strip = getStrip(book.pages[i]);
        if (strip) {
          const imgUrl = (mode === 'clean' && strip.exportImageUrl) ? strip.exportImageUrl : strip.finishedImageUrl;
          doc.addImage(imgUrl, 'PNG', 0, 0, book.width, book.height);
          addMetadata(i + 1, totalItems);
          if (i < totalItems - 1) doc.addPage();
        }
      }

      doc.save(`${book.title.replace(/\s+/g, '_')}_${mode}.pdf`);
    } catch (e) {
      alert('PDF generation failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex gap-10 p-10 overflow-hidden">
      <div className="w-1/4 bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden shadow-xl">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
          <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Production Vault</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((s, idx) => (
              <div key={s.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl group shadow-sm hover:border-slate-400 transition-all relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); if(window.confirm('Remove from vault?')) onDeleteHistoryItem(s.id); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg hover:scale-110 active:scale-95"
                  title="Delete from Vault"
                >
                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                </button>
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-4 bg-white border border-slate-100">
                  <CachedImage 
                    src={s.finishedImageUrl} 
                    className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                    onClick={() => onPreviewImage(s.finishedImageUrl)}
                    alt={s.name}
                  />
                </div>
                <div className="text-[11px] font-black truncate text-slate-800 uppercase mb-4 tracking-tight px-1">{s.name}</div>
                <button 
                  data-guide={idx === 0 ? "binder-add" : undefined}
                  onClick={() => addToBook(s.id)} 
                  disabled={book.pages.includes(s.id)}
                  className={`w-full text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md ${book.pages.includes(s.id) ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-slate-800 hover:bg-slate-900 active:scale-95'}`}
                >
                  {book.pages.includes(s.id) ? 'Bound' : 'Bind to Volume'}
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
              <i className="fa-solid fa-box-open text-4xl mb-4"></i>
              <p className="text-[10px] font-black uppercase tracking-widest">Vault Empty</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 flex flex-col overflow-hidden shadow-2xl relative">
        <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <input 
                type="text" 
                value={book.title} 
                onChange={e => onUpdateBook({...book, title: e.target.value})}
                className="bg-transparent border-none text-slate-800 font-comic text-3xl outline-none focus:ring-0 w-80 uppercase tracking-widest"
                placeholder="Volume Title..."
              />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{book.pages.length + (book.coverImageUrl ? 1 : 0)} Pages Registered</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                data-guide="binder-cover"
                onClick={onManageCover}
                className="h-14 w-14 rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              >
                {book.coverImageUrl ? <CachedImage src={book.coverImageUrl} className="w-full h-full object-cover" /> : <span className="text-slate-300 text-xl">🖼️</span>}
              </button>
              <button 
                onClick={onOpenSettings}
                className="h-14 w-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all shadow-md"
              >
                <i className="fa-solid fa-gear"></i>
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm ml-4">
              <button 
                onClick={() => setViewMode('finished')}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'finished' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Finished
              </button>
              <button 
                onClick={() => setViewMode('clean')}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'clean' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Clean
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              data-guide="binder-reader"
              onClick={handleLaunchReader} 
              className="bg-slate-800 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl hover:bg-slate-900 shadow-xl transition-all active:scale-95"
            >
              Open Reader 📖
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10">
          {book.coverImageUrl && (
            <div className="bg-slate-50/40 p-8 rounded-[2rem] border border-slate-100 flex gap-10 group shadow-sm hover:shadow-xl hover:border-slate-200 transition-all">
              <div className="w-16 h-16 flex items-center justify-center bg-white border border-slate-200 rounded-3xl font-black text-slate-800 text-3xl font-header shadow-md">0</div>
              <div className="w-80 aspect-[16/9] shrink-0 bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-2xl">
                <CachedImage 
                  src={book.coverImageUrl} 
                  className="w-full h-full object-cover cursor-zoom-in" 
                  onClick={() => onPreviewImage(book.coverImageUrl!)} 
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-2">
                <h4 className="font-header text-5xl text-slate-800 uppercase tracking-tight">Cover Page</h4>
                <div className="flex gap-10">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cover View Only</span>
                </div>
              </div>
            </div>
          )}
          {book.pages
            .map(id => ({ id, strip: getStrip(id) }))
            .filter(item => !!item.strip)
            .map(({ id, strip }, index) => {
              if (!strip) return null; // Type guard
              return (
                <div 
                  key={id}
                  draggable
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  className="bg-slate-50/40 p-8 rounded-[2rem] border border-slate-100 flex gap-10 group shadow-sm hover:shadow-xl hover:border-slate-200 transition-all cursor-move"
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-white border border-slate-200 rounded-3xl font-black text-slate-800 text-3xl font-header shadow-md">{index + 1}</div>
                <div className="w-80 aspect-[16/9] shrink-0 bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-2xl">
                  <CachedImage 
                    src={viewMode === 'finished' ? strip.finishedImageUrl : (strip.exportImageUrl || strip.finishedImageUrl)} 
                    className="w-full h-full object-cover cursor-zoom-in" 
                    onClick={() => onPreviewImage(viewMode === 'finished' ? strip.finishedImageUrl : (strip.exportImageUrl || strip.finishedImageUrl))} 
                  />
                  {viewMode === 'clean' && !strip.exportImageUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">No Clean Version</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <h4 className="font-header text-5xl text-slate-800 uppercase tracking-tight">{strip.name}</h4>
                  <div className="flex gap-10">
                    <button onClick={() => onEditPage(strip)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 transition-colors tracking-widest">Studio View</button>
                    <button onClick={() => removePage(id)} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors tracking-widest">Detach Page</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {book.pages.length > 0 && (
          <div className="p-12 border-t border-slate-100 bg-slate-50 flex justify-center gap-6">
            <button 
              data-guide="binder-pdf"
              onClick={() => handleExportPDF(viewMode)} 
              disabled={isExporting} 
              className="bg-white border border-slate-200 text-slate-800 font-black uppercase text-[10px] tracking-widest px-12 py-5 rounded-2xl shadow-xl hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center gap-3"
            >
              <i className="fa-solid fa-file-pdf"></i>
              {isExporting ? 'Generating PDF...' : 'Export PDF'}
            </button>
            <button 
              data-guide="binder-zip"
              onClick={handleExportZip} 
              disabled={isZipping} 
              className="bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest px-12 py-5 rounded-2xl shadow-2xl hover:bg-slate-900 disabled:opacity-50 transition-all flex items-center gap-3"
            >
              <i className="fa-solid fa-file-zipper"></i>
              {isZipping ? 'Compressing...' : 'Export Assets (ZIP)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
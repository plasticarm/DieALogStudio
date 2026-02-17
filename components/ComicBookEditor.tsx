import React, { useState } from 'react';
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
  history: SavedComicStrip[];
}

export const ComicBookEditor: React.FC<ComicBookEditorProps> = ({ 
  book, onUpdateBook, onEditPage, onPreviewImage, onLaunchReader, onManageCover, onOpenSettings, activeSeriesId, history
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'master' | 'export'>('master');

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

      if (book.coverImageUrl) {
        doc.addImage(book.coverImageUrl, 'PNG', 0, 0, book.width, book.height);
        doc.addPage();
      }

      const totalItems = book.pages.length + book.externalPageUrls.length;

      for (let i = 0; i < book.pages.length; i++) {
        const strip = getStrip(book.pages[i]);
        if (strip) {
          const imgUrl = (mode === 'export' && strip.exportImageUrl) ? strip.exportImageUrl : strip.finishedImageUrl;
          doc.addImage(imgUrl, 'PNG', 0, 0, book.width, book.height);
          addMetadata(i + 1, totalItems);
          if (i < totalItems - 1) doc.addPage();
        }
      }

      for (let i = 0; i < book.externalPageUrls.length; i++) {
        const url = book.externalPageUrls[i];
        doc.addImage(url, 'JPEG', 0, 0, book.width, book.height);
        addMetadata(book.pages.length + i + 1, totalItems);
        if (i < book.externalPageUrls.length - 1) doc.addPage();
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
      <div className="w-1/4 bg-slate-800 rounded-[2.5rem] border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-700">
          <span className="font-black text-slate-100 uppercase tracking-[0.2em] text-[10px]">Production Vault</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredHistory.length === 0 && (
            <div className="text-center py-20 px-4">
              <div className="text-5xl mb-4 opacity-5">📑</div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No assets for this series yet.</p>
            </div>
          )}
          {filteredHistory.map(s => (
            <div key={s.id} className="p-4 bg-slate-700/40 border border-slate-600/50 rounded-2xl group shadow-lg hover:border-brand-500 transition-all">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-4">
                <img 
                  src={s.finishedImageUrl} 
                  className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                  onClick={() => onPreviewImage(s.finishedImageUrl)}
                />
              </div>
              <div className="text-[11px] font-black truncate text-slate-100 uppercase mb-4 tracking-tight px-1">{s.name}</div>
              <button 
                onClick={() => addToBook(s.id)} 
                disabled={book.pages.includes(s.id)}
                className={`w-full text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md ${book.pages.includes(s.id) ? 'bg-slate-800 cursor-not-allowed text-slate-600' : 'bg-brand-600 hover:bg-brand-700 active:scale-95'}`}
              >
                {book.pages.includes(s.id) ? 'Bound' : 'Add to Volume'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-300 flex flex-col overflow-hidden shadow-2xl relative">
        <div className="px-8 py-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <input 
                type="text" 
                value={book.title} 
                onChange={e => onUpdateBook({...book, title: e.target.value})}
                className="bg-transparent border-none text-white font-comic text-3xl outline-none focus:ring-0 w-80 uppercase tracking-widest"
                placeholder="Volume Title..."
              />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{book.pages.length} Registered Pages</span>
            </div>
            <button 
              onClick={onManageCover}
              className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-slate-600 bg-slate-700 flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
            >
              {book.coverImageUrl ? <img src={book.coverImageUrl} className="w-full h-full object-cover" /> : <span className="text-slate-500 text-xl">🖼️</span>}
            </button>
            <button 
              onClick={onOpenSettings}
              className="h-14 w-14 bg-slate-700 rounded-2xl flex items-center justify-center text-white border border-slate-600 hover:bg-slate-600 transition-all shadow-2xl"
            >
              ⚙️
            </button>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-slate-900/50 p-1 rounded-xl">
              <button onClick={() => setViewMode('master')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg ${viewMode === 'master' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>Production</button>
              <button onClick={() => setViewMode('export')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg ${viewMode === 'export' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>Export</button>
            </div>
            <button onClick={handleLaunchReader} className="bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl hover:bg-brand-700 shadow-2xl transition-all">Open Reader 📖</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10">
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
                className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 flex gap-10 group shadow-lg hover:shadow-2xl transition-all cursor-move"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-3xl font-black text-slate-800 text-3xl font-header">{index + 1}</div>
                <div className="w-80 aspect-[16/9] shrink-0 bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl">
                  <img src={currentImg} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(currentImg)} />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="font-header text-4xl text-slate-800 uppercase tracking-tight">{strip.name}</h4>
                  <div className="flex gap-8">
                    <button onClick={() => onEditPage(strip)} className="text-[11px] font-black uppercase text-brand-600 hover:underline tracking-widest">Studio View</button>
                    <button onClick={() => removePage(id)} className="text-[11px] font-black uppercase text-rose-500 hover:underline tracking-widest">Detach Page</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {book.pages.length > 0 && (
          <div className="p-10 border-t border-slate-200 bg-white flex justify-center gap-8">
            <button onClick={() => handleExportPDF('master')} disabled={isExporting} className="bg-slate-800 text-white font-black uppercase text-[11px] px-10 py-4 rounded-2xl shadow-xl disabled:opacity-50">📄 Export PDF</button>
          </div>
        )}
      </div>
    </div>
  );
};
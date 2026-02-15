import React from 'react';
import { ComicBook } from '../types';

interface BookSettingsProps {
  book: ComicBook;
  onUpdateBook: (book: ComicBook) => void;
  onBack: () => void;
  globalColor: string;
  onUpdateGlobalColor: (color: string) => void;
}

export const BookSettings: React.FC<BookSettingsProps> = ({ book, onUpdateBook, onBack, globalColor, onUpdateGlobalColor }) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdateBook({ ...book, logoUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExternalUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const urls = e.target.value.split('\n').filter(url => url.trim().length > 0);
    onUpdateBook({ ...book, externalPageUrls: urls });
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <button onClick={onBack} className="text-slate-600 font-black uppercase text-[10px] tracking-widest hover:underline">← Back to Editor</button>
          <h2 className="text-4xl font-header text-slate-800 tracking-widest uppercase">Volume Settings</h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-300 shadow-xl p-10 overflow-y-auto space-y-10 flex-1">
          {/* Global Theme */}
          <section className="space-y-4">
            <h3 className="text-sm font-header uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Global Environment Theme</h3>
            <div className="flex items-center gap-6">
              <input 
                type="color" 
                value={globalColor} 
                onChange={e => onUpdateGlobalColor(e.target.value)}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-200"
              />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Global Background Color</p>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">Changes the workspace and reader background across the entire application.</p>
              </div>
            </div>
          </section>

          {/* Dimensions */}
          <section className="space-y-4">
            <h3 className="text-sm font-header uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Page Dimensions (PX)</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Canvas Width</label>
                <input 
                  type="number" 
                  value={book.width} 
                  onChange={e => onUpdateBook({ ...book, width: Number(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg p-3 font-bold outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Canvas Height</label>
                <input 
                  type="number" 
                  value={book.height} 
                  onChange={e => onUpdateBook({ ...book, height: Number(e.target.value) })}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg p-3 font-bold outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          </section>

          {/* Logo / Branding */}
          <section className="space-y-4">
            <h3 className="text-sm font-header uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Production Branding</h3>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                {book.logoUrl ? (
                  <img src={book.logoUrl} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[9px] font-black text-slate-400 uppercase text-center px-2">Logo</span>
                )}
                <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-slate-800">Uploader Studio Badge</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Appears on every page header/footer.</p>
              </div>
            </div>
          </section>

          {/* External Assets */}
          <section className="space-y-4">
            <h3 className="text-sm font-header uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">External Assets (URLs)</h3>
            <textarea 
              value={book.externalPageUrls.join('\n')} 
              onChange={handleExternalUrlsChange}
              placeholder="https://example.com/page1.png..."
              className="w-full bg-slate-100 border border-slate-300 rounded-lg p-4 font-mono text-[11px] h-32 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-header uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Pagination</h3>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800">Display Page Numbers</p>
              <input 
                type="checkbox" 
                checked={book.showPageNumbers} 
                onChange={e => onUpdateBook({ ...book, showPageNumbers: e.target.checked })}
                className="w-6 h-6 rounded accent-brand-600"
              />
            </div>
          </section>

          <div className="pt-10 flex justify-center shrink-0">
             <button onClick={onBack} className="bg-emerald-700 text-white px-12 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-800 transition">✓ Finalize Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};
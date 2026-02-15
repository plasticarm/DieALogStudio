import React from 'react';
import { ComicBook, ComicProfile, SavedComicStrip } from '../types';

interface BooksLibraryProps {
  comics: ComicProfile[];
  books: ComicBook[];
  history: SavedComicStrip[];
  onOpenBook: (bookId: string) => void;
  activeSeriesId: string | null;
}

export const BooksLibrary: React.FC<BooksLibraryProps> = ({ comics, books, history, onOpenBook, activeSeriesId }) => {
  return (
    <div className="h-full p-10 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-black/5 pb-8">
          <h2 className="text-5xl font-header text-slate-800 uppercase tracking-tight">Series Library</h2>
          <p className="text-slate-600 font-medium text-lg mt-2">Select a series to initialize the Production Studio, DNA configurations, and Volume Assembly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
          {comics.map(series => {
            const book = books.find(b => b.id === series.id);
            const isActive = activeSeriesId === series.id;
            const seriesHistoryCount = history.filter(h => h.comicProfileId === series.id).length;
            
            return (
              <div 
                key={series.id}
                onClick={() => onOpenBook(series.id)}
                className={`group bg-white rounded-2xl border transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 relative cursor-pointer overflow-hidden flex flex-col h-full ${
                  isActive ? 'border-brand-600 ring-4 ring-brand-100 shadow-xl scale-[1.02]' : 'border-slate-200 shadow-lg'
                }`}
              >
                {isActive && (
                  <div className="absolute top-4 right-4 bg-brand-600 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest z-20 rounded-full shadow-lg">
                    Current Active
                  </div>
                )}

                <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden shrink-0">
                  {book?.coverImageUrl ? (
                    <img src={book.coverImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={series.name} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center bg-brand-50">
                      <span className="text-8xl mb-4 opacity-10 grayscale">🎨</span>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Awaiting Cover Art</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                      {isActive ? 'Resume Production' : 'Initialize Studio'}
                    </div>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-header text-4xl text-slate-800 uppercase leading-none mb-4 group-hover:text-brand-600 transition-colors">{series.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded border border-slate-200">
                        {seriesHistoryCount} Assets Generated
                      </span>
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded border border-slate-200">
                        {book?.pages?.length || 0} Pages Bound
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium italic border-t border-slate-50 pt-4 leading-relaxed">
                    {series.artStyle.length > 80 ? series.artStyle.substring(0, 80) + '...' : series.artStyle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
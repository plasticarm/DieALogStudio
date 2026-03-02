import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ComicBook, ComicProfile, SavedComicStrip } from '../types';
import { CachedImage } from './CachedImage';
import { imageStore } from '../services/imageStore';
import { GENRES } from '../constants';

const LazyVideo: React.FC<{ src: string, className?: string }> = ({ src, className }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !src) return;

    const resolve = async () => {
      if (src.startsWith('vault:')) {
        const url = await imageStore.getImage(src);
        if (url) setResolvedSrc(url);
      } else {
        setResolvedSrc(src);
      }
    };

    resolve();
  }, [src, isInView]);

  if (!isInView || !resolvedSrc) {
    return <div ref={containerRef} className={`bg-slate-900 animate-pulse ${className}`} />;
  }

  return (
    <video 
      src={resolvedSrc} 
      autoPlay 
      loop 
      muted 
      playsInline 
      className={className} 
    />
  );
};

interface BooksLibraryProps {
  comics: ComicProfile[];
  books: ComicBook[];
  history: SavedComicStrip[];
  onOpenBook: (bookId: string) => void;
  onCreateComic: () => void;
  onDeleteComic: (id: string) => void;
  onClearHistory: () => void;
  onSyncLibrary: () => void;
  activeSeriesId: string | null;
}

export const BooksLibrary: React.FC<BooksLibraryProps> = ({ 
  comics, books, history, onOpenBook, onCreateComic, onDeleteComic, onClearHistory, onSyncLibrary, activeSeriesId 
}) => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComics = useMemo(() => {
    return comics.filter(c => {
      const matchesGenre = !selectedGenreId || c.category === selectedGenreId;
      const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [comics, selectedGenreId, searchQuery]);

  return (
    <div className="h-full p-10 overflow-y-auto" style={{ backgroundColor: !activeSeriesId ? '#dbdac8' : undefined }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-black/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
            <h2 className="text-5xl font-header text-slate-800 uppercase tracking-tight">Series Library</h2>
            <p className="text-slate-600 font-medium text-lg mt-2">Manage your production catalog. Initialize new series or resume existing episodes.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="text"
                placeholder="Search series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>
            <button 
              onClick={onSyncLibrary}
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              title="Sync missing series from the master list"
            >
              <i className="fa-solid fa-rotate"></i>
              Sync Library
            </button>
            <button 
              onClick={onCreateComic}
              className="w-full sm:w-auto bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-plus"></i>
              New Production
            </button>
          </div>
        </div>

        {/* Genre Filter Bar */}
        <div className="mb-10 flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedGenreId(null)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedGenreId === null 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Genres
          </button>
          {GENRES.map(genre => (
            <button 
              key={genre.id}
              onClick={() => setSelectedGenreId(genre.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                selectedGenreId === genre.id 
                  ? 'text-slate-900 shadow-lg ring-2 ring-offset-2 ring-slate-900' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
              style={selectedGenreId === genre.id ? { backgroundColor: genre.color } : {}}
            >
              <span>{genre.icon}</span>
              <span>{genre.name}</span>
            </button>
          ))}
        </div>

        {filteredComics.length === 0 ? (
          <div className="py-40 text-center">
            <div className="text-6xl mb-6 opacity-20">🔍</div>
            <h3 className="text-2xl font-header text-slate-400 uppercase">No results found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your filters or search query.</p>
            <button 
              onClick={() => { setSelectedGenreId(null); setSearchQuery(''); }}
              className="mt-6 text-brand-600 font-black uppercase text-[10px] tracking-widest hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
            {filteredComics.map((series, idx) => {
              const book = books.find(b => b.id === series.id);
              const isActive = activeSeriesId === series.id;
              const seriesHistoryCount = history.filter(h => h.comicProfileId === series.id).length;
              const genre = GENRES.find(g => g.id === series.category);
              
              return (
                <div 
                  key={series.id}
                  data-guide={idx === 0 ? "library-series" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenBook(series.id);
                  }}
                  className={`group bg-white rounded-2xl border transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 relative cursor-pointer overflow-hidden flex flex-col h-full ${
                    isActive ? 'border-brand-600 ring-4 ring-brand-100 shadow-xl scale-[1.02]' : 'border-slate-200 shadow-lg'
                  }`}
                >
                  <div className="absolute top-4 left-4 z-40">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if(window.confirm(`Are you sure you want to delete "${series.name}"? This will permanently erase all episodes and binder pages associated with this series.`)) {
                          onDeleteComic(series.id);
                        }
                      }}
                      className="w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white transform hover:scale-110 active:scale-90"
                      title="Delete Series Permanently"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>

                  {isActive && (
                    <div className="absolute top-4 right-4 bg-brand-600 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest z-20 rounded-full shadow-lg">
                      Current Active
                    </div>
                  )}

                  <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden shrink-0">
                    {series.libraryVideoUrl ? (
                      <LazyVideo 
                        src={series.libraryVideoUrl} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : book?.coverImageUrl ? (
                      <CachedImage src={book.coverImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={series.name} />
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

                    {/* Genre Graphic Indicator */}
                    {genre && (
                      <div className="absolute bottom-4 right-4 z-40 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-lg flex items-center gap-2 transform group-hover:scale-110 transition-all duration-300">
                        <span className="text-sm">{genre.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{genre.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="p-8 flex-1 flex flex-col justify-between transition-all duration-500"
                    style={{ backgroundColor: genre?.color || 'white' }}
                  >
                    <div>
                      <h3 className="font-header text-4xl text-slate-800 uppercase leading-none mb-4 group-hover:text-brand-600 transition-colors truncate">{series.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-white/60 backdrop-blur-sm text-slate-500 text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded border border-black/5">
                          {seriesHistoryCount} Assets
                        </span>
                        <span className="bg-white/60 backdrop-blur-sm text-slate-500 text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded border border-black/5">
                          {book?.pages?.length || 0} Bound
                        </span>
                        {genre && (
                          <span className="bg-white/80 text-slate-600 text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded border border-black/5">
                            {genre.icon} {genre.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-20 pb-40">
            <div className="mb-10 border-b border-black/5 pb-6 flex justify-between items-end">
              <div>
                <h3 className="text-3xl font-header text-slate-800 uppercase tracking-widest">Recent Production Assets</h3>
                <p className="text-slate-500 text-sm mt-1">Quick access to your latest generated comic strips across all series.</p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear ALL production history? This will free up significant storage space but you will lose access to these generated strips unless they are bound to a volume.')) {
                    onClearHistory();
                  }
                }}
                className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-broom"></i>
                Clear All History
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {history.slice(0, 8).map(strip => (
                <div 
                  key={strip.id} 
                  onClick={() => onOpenBook(strip.comicProfileId)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                    <CachedImage src={strip.finishedImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest">
                      {strip.arTargetId}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[9px] font-black text-brand-600 uppercase tracking-widest mb-1">
                      {comics.find(c => c.id === strip.comicProfileId)?.name || 'Unknown Series'}
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">{strip.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

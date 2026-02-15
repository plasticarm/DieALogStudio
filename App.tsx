import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ComicGenerator } from './components/ComicGenerator';
import { TrainingCenter } from './components/TrainingCenter';
import { ComicBookEditor } from './components/ComicBookEditor';
import { BooksLibrary } from './components/BooksLibrary';
import { CoverGenerator } from './components/CoverGenerator';
import { BookSettings } from './components/BookSettings';
import { INITIAL_COMICS } from './constants';
import { ComicProfile, SavedComicStrip, ComicBook, ProjectState } from './types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window { aistudio?: AIStudio; }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'generate' | 'train' | 'book' | 'books'>('books');
  const [comics, setComics] = useState<ComicProfile[]>(INITIAL_COMICS);
  const [books, setBooks] = useState<ComicBook[]>([]);
  const [globalColor, setGlobalColor] = useState('#dbdac8');
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  
  const [isManagingCover, setIsManagingCover] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [activeEditingStrip, setActiveEditingStrip] = useState<SavedComicStrip | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [readModePages, setReadModePages] = useState<SavedComicStrip[] | null>(null);
  const [history, setHistory] = useState<SavedComicStrip[]>([]);

  // Initialize books and state
  useEffect(() => {
    const savedComics = localStorage.getItem('diealog_comics');
    const parsedComics: ComicProfile[] = savedComics ? JSON.parse(savedComics) : INITIAL_COMICS;
    setComics(parsedComics);

    const savedHistory = localStorage.getItem('diealog_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedBooks = localStorage.getItem('diealog_books');
    let parsedBooks: ComicBook[] = savedBooks ? JSON.parse(savedBooks) : [];

    // Ensure every comic has a book entry
    const existingBookIds = new Set(parsedBooks.map(b => b.id));
    const newBooks = parsedComics
      .filter(c => !existingBookIds.has(c.id))
      .map(c => ({
        id: c.id, 
        title: c.name,
        description: `Production notes for ${c.name}`,
        pages: [],
        timestamp: Date.now(),
        width: 1920,
        height: 1080,
        externalPageUrls: [],
        showPageNumbers: true,
        pageNumberPosition: 'bottom' as const
      }));

    if (newBooks.length > 0) {
      parsedBooks = [...parsedBooks, ...newBooks];
      localStorage.setItem('diealog_books', JSON.stringify(parsedBooks));
    }
    setBooks(parsedBooks);

    const savedColor = localStorage.getItem('diealog_global_color');
    if (savedColor) setGlobalColor(savedColor);

    const savedActiveId = localStorage.getItem('diealog_active_series');
    if (savedActiveId) setActiveSeriesId(savedActiveId);
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await window.aistudio?.hasSelectedApiKey();
        setHasKey(selected ?? false);
      } catch (e) { setHasKey(false); }
    };
    checkKey();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReadModePages(null);
        setPreviewImage(null);
        if (isManagingCover) setIsManagingCover(false);
        if (isEditingSettings) setIsEditingSettings(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isManagingCover, isEditingSettings]);

  const handleOpenKeyDialog = async () => {
    await window.aistudio?.openSelectKey();
    setHasKey(true);
  };

  const handleUpdateComics = (newComics: ComicProfile[]) => {
    setComics(newComics);
    localStorage.setItem('diealog_comics', JSON.stringify(newComics));
  };

  const handleUpdateBook = (updatedBook: ComicBook) => {
    const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
    setBooks(updatedBooks);
    localStorage.setItem('diealog_books', JSON.stringify(updatedBooks));
  };

  const handleUpdateGlobalColor = (color: string) => {
    setGlobalColor(color);
    localStorage.setItem('diealog_global_color', color);
  };

  const handleOpenBook = (bookId: string) => {
    setActiveSeriesId(bookId);
    localStorage.setItem('diealog_active_series', bookId);
    setCurrentTab('generate'); // Switch to Studio directly upon selection
  };

  const startEditPage = (strip: SavedComicStrip) => {
    setActiveEditingStrip(strip);
    setCurrentTab('generate');
  };

  const handleExportProject = () => {
    const currentHistory = JSON.parse(localStorage.getItem('diealog_history') || '[]');
    const project: ProjectState = {
      version: '3.0.0', 
      comics, 
      history: currentHistory, 
      bookPages: [],
      books, 
      timestamp: Date.now(),
      globalBackgroundColor: globalColor
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diealog_workspace_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string) as ProjectState;
        localStorage.setItem('diealog_comics', JSON.stringify(project.comics || INITIAL_COMICS));
        localStorage.setItem('diealog_history', JSON.stringify(project.history || []));
        localStorage.setItem('diealog_books', JSON.stringify(project.books || []));
        if (project.globalBackgroundColor) {
          localStorage.setItem('diealog_global_color', project.globalBackgroundColor);
        }
        window.location.reload(); 
      } catch (err) { alert('Import process encountered an error.'); }
    };
    reader.readAsText(file);
  };

  const activeComic = useMemo(() => comics.find(c => c.id === activeSeriesId), [comics, activeSeriesId]);
  const activeBook = useMemo(() => books.find(b => b.id === activeSeriesId), [books, activeSeriesId]);

  return (
    <div 
      className="flex flex-col h-screen font-sans selection:bg-brand-200 overflow-hidden transition-all duration-700"
      style={{ backgroundColor: globalColor }}
    >
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onExport={handleExportProject}
        onImport={handleImportProject}
      />
      
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Workspace Texture */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {hasKey === false && (
            <div className="bg-slate-900 text-slate-100 px-8 py-2.5 flex items-center justify-between shadow-2xl shrink-0 z-20">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Gemini AI Studio: Pro Tier Authorization Required</p>
              </div>
              <button onClick={handleOpenKeyDialog} className="bg-white text-slate-900 px-6 py-1.5 rounded-full text-[10px] font-black uppercase hover:bg-brand-100 transition-all shadow-xl active:scale-95">Open Key Vault</button>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {currentTab === 'books' && (
              <BooksLibrary 
                onOpenBook={handleOpenBook} 
                comics={comics}
                books={books}
                history={history}
                activeSeriesId={activeSeriesId}
              />
            )}
            
            {currentTab === 'book' && activeBook && (
              isManagingCover ? (
                <CoverGenerator 
                  book={activeBook} 
                  comics={comics} 
                  onSaveCover={(url) => { handleUpdateBook({...activeBook, coverImageUrl: url}); setIsManagingCover(false); }}
                  onBack={() => setIsManagingCover(false)}
                />
              ) : isEditingSettings ? (
                <BookSettings 
                  book={activeBook} 
                  onUpdateBook={handleUpdateBook} 
                  onBack={() => setIsEditingSettings(false)}
                  globalColor={globalColor}
                  onUpdateGlobalColor={handleUpdateGlobalColor}
                />
              ) : (
                <ComicBookEditor 
                  book={activeBook}
                  onUpdateBook={handleUpdateBook}
                  onEditPage={startEditPage} 
                  onPreviewImage={setPreviewImage} 
                  onLaunchReader={setReadModePages}
                  onManageCover={() => setIsManagingCover(true)}
                  onOpenSettings={() => setIsEditingSettings(true)}
                  activeSeriesId={activeSeriesId}
                />
              )
            )}

            {currentTab === 'generate' && activeComic && (
              <ComicGenerator 
                key={activeEditingStrip?.id || activeComic.id} 
                activeComic={activeComic} 
                initialStrip={activeEditingStrip}
                onPreviewImage={setPreviewImage}
              />
            )}

            {currentTab === 'train' && activeComic && (
              <TrainingCenter 
                editingComic={activeComic}
                onUpdateComic={(updated) => handleUpdateComics(comics.map(c => c.id === updated.id ? updated : c))}
                onPreviewImage={setPreviewImage} 
                globalColor={globalColor}
                onUpdateGlobalColor={handleUpdateGlobalColor}
              />
            )}

            {/* Empty State for context-driven tabs when no series is active */}
            {currentTab !== 'books' && !activeSeriesId && (
              <div className="flex items-center justify-center h-full text-slate-400 p-10">
                <div className="text-center bg-white/40 backdrop-blur-3xl p-20 rounded-[3rem] border-2 border-white/50 shadow-[0_50px_100px_rgba(0,0,0,0.1)] max-w-2xl">
                  <span className="text-9xl mb-10 block grayscale opacity-20">📚</span>
                  <h3 className="text-5xl font-header uppercase tracking-widest text-slate-800 mb-4">No Series Active</h3>
                  <p className="text-sm font-bold uppercase text-slate-500 tracking-[0.2em] leading-relaxed">
                    A Series context is required for Studio and Volume production. Please choose a series from your library to initialize the workspace.
                  </p>
                  <button 
                    onClick={() => setCurrentTab('books')} 
                    className="mt-12 bg-slate-800 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl active:scale-95 flex items-center gap-4 mx-auto"
                  >
                    <span>Open Library Index</span>
                    <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reader Mode (Portal-like) */}
      {readModePages && activeBook && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center overflow-hidden animate-in fade-in duration-500" style={{ backgroundColor: globalColor }}>
          <div className="w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-10 py-6 flex justify-between items-center shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
               <h2 className="text-white font-comic text-4xl tracking-[0.3em] uppercase">{activeBook.title}</h2>
               <span className="bg-brand-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{activeBook.pages.length} Pages</span>
            </div>
            <div className="flex items-center gap-10">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] bg-slate-800 px-6 py-2.5 rounded-full border border-slate-700 shadow-inner">ESC TO EXIT DEPTH VIEW</span>
              <button onClick={() => setReadModePages(null)} className="text-slate-500 text-6xl hover:text-white transition-all transform hover:rotate-90 leading-none">×</button>
            </div>
          </div>
          <div className="flex-1 w-full overflow-y-auto read-mode-scroll pb-96 space-y-60 py-32 px-10">
            {activeBook.coverImageUrl && (
              <div className="max-w-6xl mx-auto read-mode-page flex flex-col items-center">
                <div style={{ aspectRatio: `${activeBook.width}/${activeBook.height}` }} className="w-full relative group">
                  <img src={activeBook.coverImageUrl} className="w-full h-full object-cover rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.9)] border-[12px] border-slate-900 transition-transform duration-1000 group-hover:scale-[1.02]" />
                  <h1 className="absolute bottom-20 left-0 right-0 text-white font-comic text-9xl text-center uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,1)] select-none">{activeBook.title}</h1>
                </div>
              </div>
            )}
            {readModePages.map((page, idx) => (
              <div key={page.id} className="read-mode-page flex flex-col items-center space-y-12 max-w-7xl mx-auto">
                <div className="w-full flex justify-between items-end border-b-2 border-slate-800/50 pb-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-slate-500 font-black uppercase text-xs tracking-[0.4em] font-handwritten">
                      {activeBook.showPageNumbers && activeBook.pageNumberPosition === 'top' && `Folio: ${idx + 1}`}
                    </span>
                    <span className="text-slate-600 font-mono text-[10px] uppercase tracking-tighter opacity-50">SYNC_ID: {page.arTargetId}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    {activeBook.logoUrl && <img src={activeBook.logoUrl} className="h-14 opacity-30 grayscale hover:grayscale-0 transition-all hover:opacity-100" />}
                    <span className="text-slate-100 font-black uppercase tracking-[0.3em] text-2xl font-comic">{page.name}</span>
                  </div>
                </div>
                <div style={{ aspectRatio: `${activeBook.width}/${activeBook.height}` }} className="w-full shadow-[0_0_150px_rgba(0,0,0,0.4)]">
                  <img src={page.finishedImageUrl} className="w-full h-full object-cover rounded-3xl border-[16px] border-slate-900 shadow-2xl" />
                </div>
                {activeBook.showPageNumbers && activeBook.pageNumberPosition === 'bottom' && (
                  <div className="text-slate-600 font-black uppercase text-xl tracking-[0.8em] font-handwritten opacity-40">Folio {idx + 1}</div>
                )}
              </div>
            ))}
            <div className="text-center py-60">
              <div className="text-slate-900 font-comic text-[180px] opacity-5 uppercase tracking-[0.8em] select-none leading-none">FIN</div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-12 cursor-zoom-out animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-8xl max-h-full">
            <img 
              src={previewImage} 
              className="max-w-full max-h-[90vh] rounded-[2rem] shadow-[0_0_150px_rgba(0,0,0,0.8)] border-[20px] border-white animate-in zoom-in-95 duration-300" 
              onClick={(e) => e.stopPropagation()} 
            />
            <button 
              className="absolute -top-10 -right-10 bg-slate-900 text-white w-20 h-20 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center font-black text-5xl hover:scale-110 hover:rotate-90 transition-all active:scale-95" 
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
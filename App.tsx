
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  interface Window { 
    aistudio?: AIStudio;
  }
}

export default function App() {
  const DEFAULT_BG_COLOR = '#dbdac8';
  const [currentTab, setCurrentTab] = useState<'generate' | 'train' | 'book' | 'books'>('books');
  const [comics, setComics] = useState<ComicProfile[]>(INITIAL_COMICS);
  const [books, setBooks] = useState<ComicBook[]>([]);
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  
  const [isManagingCover, setIsManagingCover] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [activeEditingStrip, setActiveEditingStrip] = useState<SavedComicStrip | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [readModePages, setReadModePages] = useState<SavedComicStrip[] | null>(null);
  const [history, setHistory] = useState<SavedComicStrip[]>([]);

  // Initialize data
  useEffect(() => {
    const savedComics = localStorage.getItem('diealog_comics');
    const parsedComics: ComicProfile[] = savedComics ? JSON.parse(savedComics) : INITIAL_COMICS;
    setComics(parsedComics);

    const savedHistory = localStorage.getItem('diealog_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedBooks = localStorage.getItem('diealog_books');
    let parsedBooks: ComicBook[] = savedBooks ? JSON.parse(savedBooks) : [];

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

    const savedActiveId = localStorage.getItem('diealog_active_series');
    if (savedActiveId) setActiveSeriesId(savedActiveId);
  }, []);

  // API Key Status Sync and Error Recovery
  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await window.aistudio?.hasSelectedApiKey();
        setHasKey(selected ?? false);
      } catch (e) { 
        setHasKey(false); 
      }
    };
    checkKey();

    // Reset logic for failed entity/keys
    const handleApiError = (e: any) => {
      const errorMsg = e.detail?.message || "";
      if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("API key not valid")) {
        setHasKey(false);
        console.warn("API state reset: Invalid or missing key detected during request.");
      }
    };

    window.addEventListener('gemini-api-error', handleApiError);
    return () => window.removeEventListener('gemini-api-error', handleApiError);
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

  const handleOpenKeyDialog = useCallback(async () => {
    await window.aistudio?.openSelectKey();
    // Guideline: Mitigate race condition by assuming success immediately
    setHasKey(true);
  }, []);

  const handleUpdateComics = (newComics: ComicProfile[]) => {
    setComics(newComics);
    localStorage.setItem('diealog_comics', JSON.stringify(newComics));
  };

  const handleUpdateBook = (updatedBook: ComicBook) => {
    const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
    setBooks(updatedBooks);
    localStorage.setItem('diealog_books', JSON.stringify(updatedBooks));
  };

  const handleSaveToHistory = (strip: SavedComicStrip) => {
    const updatedHistory = [strip, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('diealog_history', JSON.stringify(updatedHistory));
  };

  const handleUpdateSeriesColor = (color: string) => {
    if (!activeSeriesId) return;
    const updatedComics = comics.map(c => c.id === activeSeriesId ? { ...c, backgroundColor: color } : c);
    handleUpdateComics(updatedComics);
  };

  const handleOpenBook = (bookId: string) => {
    setActiveSeriesId(bookId);
    localStorage.setItem('diealog_active_series', bookId);
    setCurrentTab('generate');
  };

  const startEditPage = (strip: SavedComicStrip) => {
    setActiveEditingStrip(strip);
    setCurrentTab('generate');
  };

  const handleExportProject = () => {
    const project: ProjectState = {
      version: '3.1.3', 
      comics, 
      history, 
      bookPages: [],
      books, 
      timestamp: Date.now(),
      globalBackgroundColor: DEFAULT_BG_COLOR
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
        window.location.reload(); 
      } catch (err) { alert('Import process encountered an error.'); }
    };
    reader.readAsText(file);
  };

  const activeComic = useMemo(() => comics.find(c => c.id === activeSeriesId), [comics, activeSeriesId]);
  const activeBook = useMemo(() => books.find(b => b.id === activeSeriesId), [books, activeSeriesId]);

  const currentBackgroundColor = useMemo(() => {
    if (currentTab === 'books' || !activeComic) return DEFAULT_BG_COLOR;
    return activeComic.backgroundColor || DEFAULT_BG_COLOR;
  }, [currentTab, activeComic]);

  return (
    <div 
      className="flex flex-col h-screen font-sans selection:bg-brand-200 overflow-hidden transition-all duration-700"
      style={{ backgroundColor: currentBackgroundColor }}
    >
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onExport={handleExportProject}
        onImport={handleImportProject}
        hasKey={hasKey}
        onOpenKeyVault={handleOpenKeyDialog}
      />
      
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {hasKey === false && (
            <div className="bg-rose-900/95 backdrop-blur-md text-white px-8 py-3 flex items-center justify-between shadow-2xl shrink-0 z-20 animate-in slide-in-from-top duration-500 border-b border-rose-800">
              <div className="flex items-center gap-5">
                <div className="bg-white/20 p-2 rounded-lg">
                  <span className="text-xl block animate-pulse">🔑</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]">AI Studio Key Required</p>
                  <p className="text-[9px] font-bold text-rose-100 uppercase tracking-widest mt-1">
                    Select a Paid Google Cloud Project key via the system vault to continue.
                  </p>
                </div>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ml-4 transition-colors"
                >
                  Check Billing Status ↗
                </a>
              </div>
              <button 
                onClick={handleOpenKeyDialog} 
                className="bg-white text-rose-900 px-8 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-rose-50 transition-all shadow-xl active:scale-95 border-2 border-white"
              >
                Open System Key Vault
              </button>
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
                  globalColor={currentBackgroundColor}
                  onUpdateGlobalColor={handleUpdateSeriesColor}
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
                  history={history}
                />
              )
            )}

            {currentTab === 'generate' && activeComic && (
              <ComicGenerator 
                key={activeEditingStrip?.id || activeComic.id} 
                activeComic={activeComic} 
                initialStrip={activeEditingStrip}
                onPreviewImage={setPreviewImage}
                onSaveHistory={handleSaveToHistory}
                history={history}
              />
            )}

            {currentTab === 'train' && activeComic && (
              <TrainingCenter 
                editingComic={activeComic}
                onUpdateComic={(updated) => handleUpdateComics(comics.map(c => c.id === updated.id ? updated : c))}
                onPreviewImage={setPreviewImage} 
                globalColor={currentBackgroundColor}
                onUpdateGlobalColor={handleUpdateSeriesColor}
              />
            )}

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

      {/* Overlays... */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-12 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-8xl max-h-full">
            <img 
              src={previewImage} 
              className="max-w-full max-h-[90vh] rounded-[2rem] shadow-[0_0_150px_rgba(0,0,0,0.8)] border-[20px] border-white animate-in zoom-in-95" 
              onClick={(e) => e.stopPropagation()} 
            />
            <button 
              className="absolute -top-10 -right-10 bg-slate-900 text-white w-20 h-20 rounded-full flex items-center justify-center font-black text-5xl hover:scale-110 transition-all" 
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

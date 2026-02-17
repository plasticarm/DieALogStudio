import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SessionModal } from './components/SessionModal';
import { ComicGenerator } from './components/ComicGenerator';
import { TrainingCenter } from './components/TrainingCenter';
import { ComicBookEditor } from './components/ComicBookEditor';
import { BooksLibrary } from './components/BooksLibrary';
import { CoverGenerator } from './components/CoverGenerator';
import { BookSettings } from './components/BookSettings';
import { INITIAL_COMICS } from './constants';
import { User, AppSession, ProjectState, ComicProfile, SavedComicStrip, ComicBook } from './types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window { 
    aistudio?: AIStudio;
  }
}

const DEFAULT_PROJECT_STATE: ProjectState = {
  version: '3.1.6',
  comics: INITIAL_COMICS,
  history: [],
  bookPages: [],
  books: INITIAL_COMICS.map(c => ({
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
  })),
  timestamp: Date.now(),
  globalBackgroundColor: '#020617',
  activeSeriesId: null
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'generate' | 'train' | 'book' | 'books'>('books');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isManagingCover, setIsManagingCover] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [activeEditingStrip, setActiveEditingStrip] = useState<SavedComicStrip | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [readModePages, setReadModePages] = useState<SavedComicStrip[] | null>(null);

  // Initialize User
  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Load Sessions for current user
  useEffect(() => {
    if (!currentUser) return;
    const sessionKey = `sessions_${currentUser.id}`;
    const savedSessions = localStorage.getItem(sessionKey);
    const parsedSessions: AppSession[] = savedSessions ? JSON.parse(savedSessions) : [];
    
    if (parsedSessions.length === 0) {
      const defaultSession: AppSession = {
        id: 'default_chronicle',
        userId: currentUser.id,
        name: 'Prime Chronicle',
        lastModified: Date.now(),
        data: { ...DEFAULT_PROJECT_STATE }
      };
      parsedSessions.push(defaultSession);
      localStorage.setItem(sessionKey, JSON.stringify(parsedSessions));
    }
    
    setSessions(parsedSessions);
    const lastActive = localStorage.getItem(`active_session_${currentUser.id}`);
    setActiveSessionId(lastActive || parsedSessions[0].id);
  }, [currentUser]);

  // Sync session state to sub-states
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || null, [sessions, activeSessionId]);
  
  const handleUpdateSessionData = useCallback((newData: Partial<ProjectState>) => {
    if (!activeSession || !currentUser) return;
    setIsSaving(true);
    
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          lastModified: Date.now(),
          data: { ...s.data, ...newData }
        };
      }
      return s;
    });
    
    setSessions(updatedSessions);
    localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updatedSessions));
    setTimeout(() => setIsSaving(false), 500);
  }, [activeSession, currentUser, sessions]);

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('app_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    setCurrentUser(null);
    setSessions([]);
    setActiveSessionId(null);
    setIsProfileOpen(false);
  };

  const handleSwitchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    if (currentUser) {
      localStorage.setItem(`active_session_${currentUser.id}`, sessionId);
    }
    setIsSessionsOpen(false);
  };

  const handleCreateSession = () => {
    if (!currentUser) return;
    const newSession: AppSession = {
      id: `session_${Date.now()}`,
      userId: currentUser.id,
      name: `New Chronicle ${sessions.length + 1}`,
      lastModified: Date.now(),
      data: { ...DEFAULT_PROJECT_STATE }
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updated));
    handleSwitchSession(newSession.id);
  };

  const handleImportSession = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        // Basic schema validation could be added here
        const newSession: AppSession = {
          id: `imported_${Date.now()}`,
          userId: currentUser!.id,
          name: importedData.name || 'Imported Chronicle',
          lastModified: Date.now(),
          data: importedData.data || DEFAULT_PROJECT_STATE
        };
        const updated = [...sessions, newSession];
        setSessions(updated);
        localStorage.setItem(`sessions_${currentUser!.id}`, JSON.stringify(updated));
        handleSwitchSession(newSession.id);
      } catch (err) { alert('Corrupted or invalid Chronicle JSON.'); }
    };
    reader.readAsText(file);
  };

  const handleExportSession = (session: AppSession) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.name.replace(/\s+/g, '_')}_data.json`;
    link.click();
  };

  const handleRenameSession = (id: string, name: string) => {
    if (!currentUser) return;
    const updated = sessions.map(s => s.id === id ? { ...s, name } : s);
    setSessions(updated);
    localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updated));
  };

  const handleDeleteSession = (id: string) => {
    if (!currentUser || sessions.length <= 1) return;
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updated));
    if (activeSessionId === id) handleSwitchSession(updated[0].id);
  };

  if (!currentUser) return <AuthModal onAuth={handleAuth} />;
  if (!activeSession) return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center animate-pulse">Initializing...</div>;

  const { comics, history, books, activeSeriesId } = activeSession.data;
  const activeComic = comics.find(c => c.id === activeSeriesId);
  const activeBook = books.find(b => b.id === activeSeriesId);

  return (
    <div className="flex flex-col h-screen font-sans selection:bg-indigo-500/30 overflow-hidden bg-slate-950">
      <Header 
        user={currentUser} 
        session={activeSession} 
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSessions={() => setIsSessionsOpen(true)}
        isSaving={isSaving}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Tab Navigation (Architect Style) */}
        <aside className="w-20 bg-slate-900/50 border-r border-slate-800 flex flex-col items-center py-8 gap-10 shrink-0">
          {[
            { id: 'books', icon: 'fa-layer-group', label: 'Vault' },
            { id: 'generate', icon: 'fa-palette', label: 'Studio' },
            { id: 'train', icon: 'fa-dna', label: 'Genome' },
            { id: 'book', icon: 'fa-book-open', label: 'Binder' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex flex-col items-center gap-2 group transition-all ${currentTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-lg ${
                currentTab === tab.id ? 'bg-indigo-600/20 shadow-indigo-500/10 border border-indigo-500/30' : 'hover:bg-slate-800'
              }`}>
                <i className={`fa-solid ${tab.icon}`}></i>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
          
          <div className="relative z-10 h-full overflow-hidden">
            {currentTab === 'books' && (
              <BooksLibrary 
                comics={comics}
                books={books}
                history={history}
                activeSeriesId={activeSeriesId}
                onOpenBook={(id) => {
                  handleUpdateSessionData({ activeSeriesId: id });
                  setCurrentTab('generate');
                }}
              />
            )}

            {currentTab === 'generate' && activeComic && (
              <ComicGenerator 
                activeComic={activeComic} 
                allComics={comics}
                onSwitchComic={(id) => handleUpdateSessionData({ activeSeriesId: id })}
                initialStrip={activeEditingStrip}
                onPreviewImage={setPreviewImage}
                onSaveHistory={(strip) => handleUpdateSessionData({ history: [strip, ...history] })}
                history={history}
              />
            )}

            {currentTab === 'train' && activeComic && (
              <TrainingCenter 
                editingComic={activeComic}
                onUpdateComic={(updated) => handleUpdateSessionData({ comics: comics.map(c => c.id === updated.id ? updated : c) })}
                onPreviewImage={setPreviewImage} 
                globalColor={activeSession.data.globalBackgroundColor}
                onUpdateGlobalColor={(color) => handleUpdateSessionData({ globalBackgroundColor: color })}
              />
            )}

            {currentTab === 'book' && activeBook && (
               isManagingCover ? (
                <CoverGenerator 
                  book={activeBook} 
                  comics={comics} 
                  onSaveCover={(url) => {
                    const updated = books.map(b => b.id === activeBook.id ? { ...b, coverImageUrl: url } : b);
                    handleUpdateSessionData({ books: updated });
                    setIsManagingCover(false);
                  }}
                  onBack={() => setIsManagingCover(false)}
                />
              ) : isEditingSettings ? (
                <BookSettings 
                  book={activeBook} 
                  onUpdateBook={(updatedBook) => handleUpdateSessionData({ books: books.map(b => b.id === updatedBook.id ? updatedBook : b) })} 
                  onBack={() => setIsEditingSettings(false)}
                  globalColor={activeSession.data.globalBackgroundColor}
                  onUpdateGlobalColor={(color) => handleUpdateSessionData({ globalBackgroundColor: color })}
                />
              ) : (
                <ComicBookEditor 
                  book={activeBook}
                  onUpdateBook={(updatedBook) => handleUpdateSessionData({ books: books.map(b => b.id === updatedBook.id ? updatedBook : b) })}
                  onEditPage={(strip) => { setActiveEditingStrip(strip); setCurrentTab('generate'); }} 
                  onPreviewImage={setPreviewImage} 
                  onLaunchReader={setReadModePages}
                  onManageCover={() => setIsManagingCover(true)}
                  onOpenSettings={() => setIsEditingSettings(true)}
                  activeSeriesId={activeSeriesId}
                  history={history}
                />
              )
            )}

            {!activeSeriesId && currentTab !== 'books' && (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                <i className="fa-solid fa-layer-group text-8xl text-slate-800 mb-8 opacity-20"></i>
                <h3 className="text-white font-header text-5xl uppercase tracking-widest mb-4">Void Cluster</h3>
                <p className="text-slate-500 uppercase tracking-widest text-xs mb-10">Choose a production cluster from the Vault to initiate the Studio Engine.</p>
                <button onClick={() => setCurrentTab('books')} className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all">Open Vault Index</button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {isProfileOpen && (
        <ProfileModal 
          user={currentUser} 
          onUpdate={handleAuth} 
          onLogout={handleLogout} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}

      {isSessionsOpen && (
        <SessionModal 
          sessions={sessions}
          activeSessionId={activeSessionId!}
          onLoad={handleSwitchSession}
          onDelete={handleDeleteSession}
          onNew={handleCreateSession}
          onImport={handleImportSession}
          onExport={handleExportSession}
          onRename={handleRenameSession}
          onClose={() => setIsSessionsOpen(false)}
        />
      )}

      {/* Overlays... */}
      {previewImage && (
        <div className="fixed inset-0 z-[2000] modal-backdrop flex items-center justify-center p-12 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-8xl max-h-full">
            <img src={previewImage} className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[12px] border-slate-900 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()} />
            <button className="absolute -top-6 -right-6 bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-all shadow-2xl" onClick={() => setPreviewImage(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {readModePages && activeBook && (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center overflow-hidden animate-in fade-in duration-500 bg-slate-950">
          <div className="w-full glass border-b border-slate-800 px-10 py-4 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-6">
                <i className="fa-solid fa-book-open text-indigo-400 text-2xl"></i>
                <h2 className="text-white font-comic text-3xl tracking-widest uppercase">{activeBook.title}</h2>
             </div>
             <button onClick={() => setReadModePages(null)} className="text-slate-500 text-4xl hover:text-white transition-all">×</button>
          </div>
          <div className="flex-1 w-full overflow-y-auto pb-96 space-y-60 py-32 px-10">
            {activeBook.coverImageUrl && (
              <div className="max-w-5xl mx-auto flex flex-col items-center">
                <img src={activeBook.coverImageUrl} className="w-full rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-[8px] border-slate-900" />
              </div>
            )}
            {readModePages.map((page, idx) => (
              <div key={page.id} className="flex flex-col items-center space-y-8 max-w-6xl mx-auto">
                <div className="w-full flex justify-between items-center text-slate-600 font-black uppercase text-[10px] tracking-widest">
                  <span>PAGE {idx + 1}</span>
                  <span className="text-indigo-500/30">{page.arTargetId}</span>
                </div>
                <img src={page.finishedImageUrl} className="w-full rounded-[2rem] shadow-2xl border-[8px] border-slate-900" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
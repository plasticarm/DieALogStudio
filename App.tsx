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
import { TestingLab } from './components/TestingLab';
import { RatingsPage } from './components/RatingsPage';
import { GuideBuddy } from './components/GuideBuddy';
import { CachedImage } from './components/CachedImage';
import { PlayMode } from './components/PlayMode';
import { INITIAL_COMICS } from './constants';
import { User, AppSession, ProjectState, ComicProfile, SavedComicStrip, ComicBook, RatedComic } from './types';
import { imageStore } from './services/imageStore';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window { 
    aistudio?: AIStudio;
  }
}

const DEFAULT_BG_COLOR = '#dbdac8';

function getLuminance(hex: string) {
  if (!hex || typeof hex !== 'string') return 0;
  const c = hex.replace('#', '');
  if (c.length < 6) return 0;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const DEFAULT_PROJECT_STATE: ProjectState = {
  version: '3.2.0',
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
  ratings: [],
  timestamp: Date.now(),
  globalBackgroundColor: DEFAULT_BG_COLOR,
  activeSeriesId: null,
  currentGuideStep: 0
};

export default function App() {
  const [appMode, setAppMode] = useState<'select' | 'edit' | 'play'>('select');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'generate' | 'train' | 'book' | 'books' | 'test' | 'rate'>('books');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isManagingCover, setIsManagingCover] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [activeEditingStrip, setActiveEditingStrip] = useState<SavedComicStrip | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resolvedPreviewImage, setResolvedPreviewImage] = useState<string | null>(null);
  const [readModePages, setReadModePages] = useState<{ pages: SavedComicStrip[], mode: 'finished' | 'clean' } | null>(null);

  // New Series Naming State
  const [isNamingNewSeries, setIsNamingNewSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');

  // Preview Image Resolution
  useEffect(() => {
    if (previewImage) {
      if (previewImage.startsWith('vault:')) {
        imageStore.getImage(previewImage).then(url => {
          setResolvedPreviewImage(url || '');
        });
      } else {
        setResolvedPreviewImage(previewImage);
      }
    } else {
      setResolvedPreviewImage(null);
    }
  }, [previewImage]);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const sessionKey = `sessions_${currentUser.id}`;
    const savedSessions = localStorage.getItem(sessionKey);
    let parsedSessions: AppSession[] = [];
    
    try {
      if (savedSessions) {
        const data = JSON.parse(savedSessions);
        if (Array.isArray(data)) {
          parsedSessions = data;
        }
      }
    } catch (e) {
      console.error("Failed to parse sessions", e);
    }
    
    if (parsedSessions.length === 0) {
      const defaultSession: AppSession = {
        id: 'default_chronicle',
        userId: currentUser.id,
        name: 'Assets',
        lastModified: Date.now(),
        data: { ...DEFAULT_PROJECT_STATE }
      };
      parsedSessions = [defaultSession];
      try {
        localStorage.setItem(sessionKey, JSON.stringify(parsedSessions));
      } catch (e) {
        console.error("Failed to save default session", e);
      }
    }
    
    setSessions(parsedSessions);
    const lastActive = localStorage.getItem(`active_session_${currentUser.id}`);
    const activeId = (lastActive && parsedSessions.find(s => s.id === lastActive)) 
      ? lastActive 
      : parsedSessions[0].id;
    setActiveSessionId(activeId);
    try {
      localStorage.setItem(`active_session_${currentUser.id}`, activeId);
    } catch (e) {}

    // Sync INITIAL_COMICS into the active session if missing
    const activeSess = parsedSessions.find(s => s.id === activeId);
    if (activeSess) {
      const existingComicIds = new Set((activeSess.data.comics || []).map(c => c.id));
      const missingComics = INITIAL_COMICS.filter(c => !existingComicIds.has(c.id));
      
      if (missingComics.length > 0) {
        console.log(`Syncing ${missingComics.length} missing comics into session ${activeId}`);
        const updatedComics = [...(activeSess.data.comics || []), ...missingComics];
        const updatedBooks = [...(activeSess.data.books || []), ...missingComics.map(c => ({
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
        }))];

        const updatedSessions = parsedSessions.map(s => {
          if (s.id === activeId) {
            return {
              ...s,
              data: {
                ...s.data,
                comics: updatedComics,
                books: updatedBooks
              }
            };
          }
          return s;
        });
        setSessions(updatedSessions);
        try {
          localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updatedSessions));
        } catch (e) {}
      } else {
        // Also sync categories/archetypes for existing comics if they are missing
        let hasChanges = false;
        const updatedComics = (activeSess.data.comics || []).map(c => {
          const initial = INITIAL_COMICS.find(ic => ic.id === c.id);
          if (initial) {
            let changed = false;
            const updated = { ...c };
            if (!updated.category && initial.category) { updated.category = initial.category; changed = true; }
            if (!updated.archetypes && initial.archetypes) { updated.archetypes = initial.archetypes; changed = true; }
            if (!updated.styleDescription && initial.styleDescription) { updated.styleDescription = initial.styleDescription; changed = true; }
            if (changed) {
              hasChanges = true;
              return updated;
            }
          }
          return c;
        });

        if (hasChanges) {
          console.log("Syncing categories/archetypes for existing comics");
          const updatedSessions = parsedSessions.map(s => {
            if (s.id === activeId) {
              return {
                ...s,
                data: { ...s.data, comics: updatedComics }
              };
            }
            return s;
          });
          setSessions(updatedSessions);
          try {
            localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updatedSessions));
          } catch (e) {}
        }
      }
    }
  }, [currentUser]);

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || null, 
  [sessions, activeSessionId]);

  const activeComic = useMemo(() => {
    if (!activeSession) return null;
    return (activeSession.data.comics || []).find(c => c.id === activeSession.data.activeSeriesId) || null;
  }, [activeSession]);

  const activeBook = useMemo(() => {
    if (!activeSession) return null;
    return (activeSession.data.books || []).find(b => b.id === activeSession.data.activeSeriesId) || null;
  }, [activeSession]);

  const currentBackgroundColor = useMemo(() => {
    if (activeComic?.backgroundColor) return activeComic.backgroundColor;
    if (activeSession?.data.globalBackgroundColor) return activeSession.data.globalBackgroundColor;
    return DEFAULT_BG_COLOR;
  }, [activeComic, activeSession]);

  const uiContrastColor = useMemo(() => {
    return getLuminance(currentBackgroundColor) > 0.5 ? 'text-slate-800' : 'text-slate-100';
  }, [currentBackgroundColor]);

  const handleUpdateSessionData = useCallback((newData: Partial<ProjectState>) => {
    if (!activeSession || !currentUser) return;
    setIsSaving(true);
    
    setSessions(prevSessions => {
      let updatedSessions = prevSessions.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            lastModified: Date.now(),
            data: { ...s.data, ...newData }
          };
        }
        return s;
      });

      const trySave = (data: typeof updatedSessions) => {
        try {
          localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(data));
          return true;
        } catch (e: any) {
          if (e.name === 'QuotaExceededError' || e.code === 22) return false;
          console.error("Storage Error:", e);
          return true;
        }
      };

      if (!trySave(updatedSessions)) {
        console.warn("Storage quota exceeded. Attempting emergency pruning...");
        alert("Vault Storage is full! Attempting to prune old history items to save your current work.");
        // Emergency Pruning Level 1: Keep only 3 most recent history items and 3 most recent ratings
        updatedSessions = updatedSessions.map(s => ({
          ...s,
          data: {
            ...s.data,
            history: (s.data.history || []).slice(0, 3),
            ratings: (s.data.ratings || []).slice(0, 3)
          }
        }));
        
        if (!trySave(updatedSessions)) {
          // Emergency Pruning Level 2: Keep only 1 most recent history item and 1 rating
          updatedSessions = updatedSessions.map(s => ({
            ...s,
            data: {
              ...s.data,
              history: (s.data.history || []).slice(0, 1),
              ratings: (s.data.ratings || []).slice(0, 1)
            }
          }));

          if (!trySave(updatedSessions)) {
            // Emergency Pruning Level 3: Clear all history and ratings
            updatedSessions = updatedSessions.map(s => ({
              ...s,
              data: {
                ...s.data,
                history: [],
                ratings: []
              }
            }));

            if (!trySave(updatedSessions)) {
              // Emergency Pruning Level 4: Clear character and environment images (keep descriptions)
              console.warn("Pruning Level 4: Clearing character/environment images...");
              updatedSessions = updatedSessions.map(s => ({
                ...s,
                data: {
                  ...s.data,
                  comics: (s.data.comics || []).map(c => ({
                    ...c,
                    characters: (c.characters || []).map(char => ({ ...char, imageUrl: undefined })),
                    environments: (c.environments || []).map(env => ({ ...env, imageUrl: undefined })),
                    styleReferenceImageUrl: undefined,
                    styleReferenceImageUrls: []
                  }))
                }
              }));

              if (!trySave(updatedSessions)) {
                // Emergency Pruning Level 5: Clear book covers
                console.warn("Pruning Level 5: Clearing book covers...");
                updatedSessions = updatedSessions.map(s => ({
                  ...s,
                  data: {
                    ...s.data,
                    books: (s.data.books || []).map(b => ({ ...b, coverImageUrl: undefined }))
                  }
                }));

                if (!trySave(updatedSessions)) {
                  console.error("Quota still exceeded after total asset purge. Storage is critically full.");
                  alert("Vault Storage is critically full. Please delete some old sessions or volumes to save new work.");
                }
              }
            }
          }
        }
      }

      return updatedSessions;
    });
    
    setTimeout(() => setIsSaving(false), 500);
  }, [activeSession?.id, currentUser?.id]);

  const handleSaveHistory = useCallback(async (strip: SavedComicStrip) => {
    if (!activeSession) return;
    
    // Vaultify the strip images before saving to reduce localStorage pressure
    const vaultifiedStrip = { ...strip };
    if (vaultifiedStrip.finishedImageUrl?.startsWith('data:')) {
      vaultifiedStrip.finishedImageUrl = await imageStore.vaultify(vaultifiedStrip.finishedImageUrl);
    }
    if (vaultifiedStrip.exportImageUrl?.startsWith('data:')) {
      vaultifiedStrip.exportImageUrl = await imageStore.vaultify(vaultifiedStrip.exportImageUrl);
    }
    if (vaultifiedStrip.imageHistory) {
      vaultifiedStrip.imageHistory = await Promise.all(
        vaultifiedStrip.imageHistory.map(img => img.startsWith('data:') ? imageStore.vaultify(img) : Promise.resolve(img))
      );
    }

    const currentHistory = activeSession.data.history || [];
    
    // Filter history for THIS series
    const seriesHistory = currentHistory.filter(h => h.comicProfileId === strip.comicProfileId);
    const otherHistory = currentHistory.filter(h => h.comicProfileId !== strip.comicProfileId);
    
    const existingIndex = seriesHistory.findIndex(h => h.id === vaultifiedStrip.id || h.arTargetId === vaultifiedStrip.arTargetId);
    let updatedSeriesHistory;
    
    if (existingIndex > -1) {
      updatedSeriesHistory = seriesHistory.map((h, i) => i === existingIndex ? vaultifiedStrip : h);
    } else {
      // Limit history to 10 items PER SERIES to prevent QuotaExceededError
      updatedSeriesHistory = [vaultifiedStrip, ...seriesHistory].slice(0, 10);
    }
    handleUpdateSessionData({ history: [...updatedSeriesHistory, ...otherHistory] });
  }, [activeSession, handleUpdateSessionData]);

  const handleConfirmCreateSeries = () => {
    if (!activeSession) return;
    const finalName = newSeriesName.trim() || 'Untitled Series';
    const newId = `c_${Date.now()}`;
    const newComic: ComicProfile = {
      id: newId,
      name: finalName,
      artStyle: 'Traditional comic book style, high contrast ink and colors',
      characters: [],
      environments: [],
      environment: 'Universal Void',
      panelCount: 3,
      backgroundColor: DEFAULT_BG_COLOR
    };
    const newBook: ComicBook = {
      id: newId,
      title: `${finalName} Vol. 1`,
      description: 'Production notes',
      pages: [],
      timestamp: Date.now(),
      width: 1920,
      height: 1080,
      externalPageUrls: [],
      showPageNumbers: true,
      pageNumberPosition: 'bottom'
    };

    handleUpdateSessionData({
      comics: [...(activeSession.data.comics || []), newComic],
      books: [...(activeSession.data.books || []), newBook]
    });
    
    setIsNamingNewSeries(false);
    setNewSeriesName('');
  };

  const handleDeleteComic = (id: string) => {
    if (!activeSession) return;
    const updatedComics = (activeSession.data.comics || []).filter(c => c.id !== id);
    const updatedBooks = (activeSession.data.books || []).filter(b => b.id !== id);
    const updatedHistory = (activeSession.data.history || []).filter(h => h.comicProfileId !== id);
    
    let newActiveId = activeSession.data.activeSeriesId;
    if (newActiveId === id) newActiveId = null;

    handleUpdateSessionData({
      comics: updatedComics,
      books: updatedBooks,
      history: updatedHistory,
      activeSeriesId: newActiveId
    });
  };

  const handleManualSync = () => {
    if (!activeSession || !currentUser) return;
    setIsSaving(true);
    try {
      localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(sessions));
    } catch (e) {}
    setTimeout(() => {
      setIsSaving(false);
      if (activeSession.data.currentGuideStep === 16) {
        handleUpdateSessionData({ currentGuideStep: 0 }); // Cycle guide
      }
    }, 1000);
  };

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('app_user', JSON.stringify(user));
    } catch (e) {}
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
      try {
        localStorage.setItem(`active_session_${currentUser.id}`, sessionId);
      } catch (e) {}
    }
    setIsSessionsOpen(false);
  };

  const handleCreateSession = () => {
    if (!currentUser) return;
    const newSession: AppSession = {
      id: `session_${Date.now()}`,
      userId: currentUser.id,
      name: `Assets ${sessions.length + 1}`,
      lastModified: Date.now(),
      data: { ...DEFAULT_PROJECT_STATE }
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    try {
      localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updated));
    } catch (e) {}
    handleSwitchSession(newSession.id);
  };

  const handleImportSession = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const validatedData = importedData.data || DEFAULT_PROJECT_STATE;
        if (!validatedData.comics || !validatedData.books) {
          throw new Error("Malformed archive data");
        }
        
        const newSession: AppSession = {
          id: `imported_${Date.now()}`,
          userId: currentUser!.id,
          name: importedData.name || 'Imported Assets',
          lastModified: Date.now(),
          data: {
            ...DEFAULT_PROJECT_STATE,
            ...validatedData,
            activeSeriesId: validatedData.activeSeriesId || null 
          }
        };
        const updated = [...sessions, newSession];
        setSessions(updated);
        try {
          localStorage.setItem(`sessions_${currentUser!.id}`, JSON.stringify(updated));
        } catch (e) {}
        handleSwitchSession(newSession.id);
      } catch (err) { alert('Invalid archive: ' + err); }
    };
    reader.readAsText(file);
  };

  const handleExportSession = (session: AppSession) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.name.replace(/\s+/g, '_')}_assets.json`;
    link.click();
  };

  const handleRenameSession = (id: string, name: string) => {
    if (!currentUser) return;
    const updated = sessions.map(s => s.id === id ? { ...s, name } : s);
    setSessions(updated);
    try {
      localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteSession = (id: string) => {
    if (!currentUser || sessions.length <= 1) return;
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    try {
      localStorage.setItem(`sessions_${currentUser.id}`, JSON.stringify(updated));
    } catch (e) {}
    if (activeSessionId === id) handleSwitchSession(updated[0].id);
  };

  const toggleGuide = () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, guideEnabled: !currentUser.guideEnabled };
    handleAuth(updatedUser);
  };

  const handleClearHistory = () => {
    handleUpdateSessionData({ history: [] });
  };

  const handleSyncLibrary = () => {
    if (!activeSession) return;
    const currentComics = activeSession.data.comics || [];
    const missingComics = INITIAL_COMICS.filter(ic => !currentComics.find(c => c.id === ic.id));
    
    if (missingComics.length > 0) {
      const updatedComics = [...currentComics, ...missingComics];
      const currentBooks = activeSession.data.books || [];
      const missingBooks = missingComics.map(c => ({
        id: c.id,
        title: c.name,
        description: `The first volume of ${c.name}`,
        pages: [],
        timestamp: Date.now(),
        width: 1200,
        height: 800,
        showPageNumbers: true,
        pageNumberPosition: 'bottom' as const,
        externalPageUrls: []
      }));
      const updatedBooks = [...currentBooks, ...missingBooks];
      
      handleUpdateSessionData({ 
        comics: updatedComics,
        books: updatedBooks
      });
      alert(`Successfully synced ${missingComics.length} new series to your library!`);
    } else {
      alert("Your library is already up to date with the latest series.");
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updatedHistory = (activeSession?.data.history || []).filter(h => h.id !== id);
    handleUpdateSessionData({ history: updatedHistory });
  };

  if (!currentUser) return <AuthModal onAuth={handleAuth} />;
  
  if (!activeSession) {
    return <div className="h-screen w-screen bg-[#dbdac8] flex items-center justify-center font-black uppercase tracking-widest text-slate-800">Initializing Workspace...</div>;
  }

  const { comics = [], history = [], books = [], ratings = [], activeSeriesId = null, currentGuideStep = 0 } = activeSession.data;

  if (appMode === 'select') {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center relative">
        <button onClick={handleLogout} className="absolute top-8 right-8 text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-xs">
          Logout
        </button>
        <div className="h-40 w-40 mx-auto mb-6 float-animation">
          <CachedImage 
            src="https://raw.githubusercontent.com/plasticarm/DieALogStudio/main/images/DieALog_Logo1.png" 
            alt="DiE-A-Log" 
            className="w-full h-full object-contain drop-shadow-2xl" 
          />
        </div>
        <h1 className="text-5xl font-header uppercase tracking-widest text-slate-800 mb-12">Select Mode</h1>
        <div className="flex gap-8">
          <button 
            onClick={() => setAppMode('edit')}
            className="w-64 h-64 bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center justify-center gap-6 hover:scale-105 hover:shadow-2xl hover:border-amber-500/50 transition-all group"
          >
            <i className="fa-solid fa-pen-ruler text-6xl text-slate-300 group-hover:text-amber-600 transition-colors"></i>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-700">Edit</span>
          </button>
          <button 
            onClick={() => setAppMode('play')}
            className="w-64 h-64 bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center justify-center gap-6 hover:scale-105 hover:shadow-2xl hover:border-amber-200 transition-all group"
          >
            <i className="fa-solid fa-gamepad text-6xl text-slate-300 group-hover:text-amber-600 transition-colors"></i>
            <span className="text-2xl font-black uppercase tracking-widest text-slate-700">Play</span>
          </button>
        </div>
      </div>
    );
  }

  if (appMode === 'play') {
    // Collect all unique pages from all binders.
    const binderPages = Array.from(new Set((activeSession?.data.books || []).flatMap(b => b.pages)));
    
    return (
      <PlayMode 
        ratings={ratings} 
        history={history} 
        comics={comics} 
        binderPages={binderPages}
        onExit={() => setAppMode('select')} 
        onAddSubmission={(submission) => {
          const currentRatings = activeSession.data.ratings || [];
          handleUpdateSessionData({ ratings: [submission, ...currentRatings] });
        }}
        onEdit={() => {
          setAppMode('select');
          setCurrentTab('generate');
        }}
      />
    );
  }

  return (
    <div 
      id="app-root-container"
      className="flex flex-col h-screen font-sans selection:bg-amber-600/20 overflow-hidden"
      style={{ backgroundColor: currentBackgroundColor }}
    >
      <Header 
        user={currentUser} 
        session={activeSession} 
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSessions={() => setIsSessionsOpen(true)}
        isSaving={isSaving}
        onManualSync={handleManualSync}
        guideEnabled={currentUser.guideEnabled}
        onToggleGuide={toggleGuide}
        onBackToModeSelect={() => setAppMode('select')}
        onPlay={() => setAppMode('play')}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 bg-white/40 backdrop-blur-md border-r border-black/5 flex flex-col items-center py-8 gap-8 shrink-0">
          {[
            { id: 'books', icon: 'fa-layer-group', label: 'Library' },
            { id: 'train', icon: 'fa-dna', label: 'Genome' },
            { id: 'generate', icon: 'fa-palette', label: 'Studio' },
            { id: 'book', icon: 'fa-book-open', label: 'Binder' },
            { id: 'test', icon: 'fa-vial-circle-check', label: 'Testing' },
            { id: 'rate', icon: 'fa-star', label: 'Vault' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex flex-col items-center gap-2 group transition-all ${currentTab === tab.id ? 'text-brand-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all relative overflow-hidden ${
                currentTab === tab.id ? 'bg-white shadow-lg border border-black/5' : 'hover:bg-black/5'
              }`}>
                {tab.id === 'books' && activeComic?.libraryVideoUrl && (
                  <video 
                    src={activeComic.libraryVideoUrl.startsWith('vault:') ? null : (activeComic.libraryVideoUrl || null)}
                    ref={async (el) => {
                      if (el && activeComic.libraryVideoUrl?.startsWith('vault:')) {
                        const url = await imageStore.getImage(activeComic.libraryVideoUrl);
                        if (url) el.src = url;
                      }
                    }}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <i className={`fa-solid ${tab.icon} relative z-10 ${tab.id === 'books' && activeComic?.libraryVideoUrl ? 'text-white drop-shadow-md' : ''}`}></i>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${currentTab === tab.id ? 'text-slate-800' : 'text-slate-400'}`}>{tab.label}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>
          
          <div className="relative z-10 h-full overflow-hidden">
            <div className={currentTab === 'books' ? 'h-full' : 'hidden'}>
              <BooksLibrary 
                comics={comics}
                books={books}
                history={history}
                activeSeriesId={activeSeriesId}
                onOpenBook={(id) => {
                  handleUpdateSessionData({ activeSeriesId: id, currentGuideStep: Math.max(currentGuideStep, 1) });
                  setCurrentTab('generate');
                }}
                onCreateComic={() => setIsNamingNewSeries(true)}
                onDeleteComic={handleDeleteComic}
                onClearHistory={handleClearHistory}
                onSyncLibrary={handleSyncLibrary}
              />
            </div>

            {activeComic && (
              <div className={currentTab === 'generate' ? 'h-full' : 'hidden'}>
                <ComicGenerator 
                  key={activeComic.id} 
                  activeComic={activeComic} 
                  allComics={comics}
                  onSwitchComic={(id) => handleUpdateSessionData({ activeSeriesId: id })}
                  initialStrip={activeEditingStrip}
                  onPreviewImage={setPreviewImage}
                  onSaveHistory={(strip) => { handleSaveHistory(strip); handleUpdateSessionData({ currentGuideStep: 6 }); }}
                  onDeleteHistoryItem={handleDeleteHistoryItem}
                  history={history}
                  contrastColor={uiContrastColor}
                  onAdvanceGuide={(step) => handleUpdateSessionData({ currentGuideStep: step })}
                />
              </div>
            )}

            {activeComic && (
              <div className={currentTab === 'train' ? 'h-full' : 'hidden'}>
                <TrainingCenter 
                  key={`train-${activeComic.id}`}
                  editingComic={activeComic}
                  onUpdateComic={(updated) => handleUpdateSessionData({ 
                    comics: comics.map(c => c.id === updated.id ? updated : c),
                    books: books.map(b => b.id === updated.id ? { ...b, title: `${updated.name} Vol. 1` } : b),
                    currentGuideStep: currentGuideStep < 13 ? 13 : currentGuideStep
                  })}
                  onPreviewImage={setPreviewImage} 
                  globalColor={currentBackgroundColor}
                  onUpdateGlobalColor={(color) => handleUpdateSessionData({ globalBackgroundColor: color })}
                  contrastColor={uiContrastColor}
                  onAdvanceGuide={(step) => handleUpdateSessionData({ currentGuideStep: step })}
                />
              </div>
            )}

            {activeBook && (
              <div className={currentTab === 'book' ? 'h-full' : 'hidden'}>
                {isManagingCover ? (
                  <CoverGenerator 
                    book={activeBook} 
                    activeComic={activeComic!}
                    onSaveCover={(url) => {
                      const updated = books.map(b => b.id === activeBook.id ? { ...b, coverImageUrl: url } : b);
                      handleUpdateSessionData({ books: updated, currentGuideStep: 10 });
                      setIsManagingCover(false);
                    }}
                    onBack={() => setIsManagingCover(false)}
                  />
                ) : isEditingSettings ? (
                  <BookSettings 
                    book={activeBook} 
                    onUpdateBook={(updatedBook) => handleUpdateSessionData({ 
                      books: books.map(b => b.id === updatedBook.id ? updatedBook : b) 
                    })} 
                    onBack={() => setIsEditingSettings(false)}
                    globalColor={currentBackgroundColor}
                    onUpdateGlobalColor={(color) => handleUpdateSessionData({ globalBackgroundColor: color })}
                  />
                ) : (
                  <ComicBookEditor 
                    book={activeBook}
                    onUpdateBook={(updatedBook) => handleUpdateSessionData({ 
                      books: books.map(b => b.id === updatedBook.id ? updatedBook : b) 
                    })}
                    onEditPage={(strip) => { setActiveEditingStrip(strip); setCurrentTab('generate'); }} 
                    onPreviewImage={setPreviewImage} 
                    onLaunchReader={(pages, mode) => { setReadModePages({ pages, mode }); handleUpdateSessionData({ currentGuideStep: 11 }); }}
                    onManageCover={() => { setIsManagingCover(true); handleUpdateSessionData({ currentGuideStep: 9 }); }}
                    onOpenSettings={() => setIsEditingSettings(true)}
                    activeSeriesId={activeSeriesId}
                    history={history}
                    onDeleteHistoryItem={handleDeleteHistoryItem}
                    contrastColor={uiContrastColor}
                    onAdvanceGuide={(step) => handleUpdateSessionData({ currentGuideStep: step })}
                  />
                )}
              </div>
            )}

            {!activeSeriesId && currentTab !== 'books' && currentTab !== 'rate' && (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                <i className={`fa-solid fa-layer-group text-8xl mb-8 opacity-40 ${uiContrastColor}`}></i>
                <h3 className={`font-header text-5xl uppercase tracking-widest mb-4 ${uiContrastColor}`}>No Series Selected</h3>
                <button onClick={() => setCurrentTab('books')} className="px-12 py-4 bg-slate-800 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all">Open Library</button>
              </div>
            )}

            {activeComic && (
              <div className={currentTab === 'test' ? 'h-full' : 'hidden'}>
                <TestingLab 
                  activeComic={activeComic}
                  history={history}
                  onUpdateHistoryItem={handleSaveHistory}
                  onAddRating={async (newRating) => {
                    const vaultifiedRating = { ...newRating };
                    if (vaultifiedRating.imageUrl?.startsWith('data:')) {
                      vaultifiedRating.imageUrl = await imageStore.vaultify(vaultifiedRating.imageUrl);
                    }
                    const currentRatings = activeSession.data.ratings || [];
                    const existing = currentRatings.find(r => r.stripId === vaultifiedRating.stripId);
                    const filtered = currentRatings.filter(r => r.stripId !== vaultifiedRating.stripId);
                    const ratingToSave = existing ? { ...vaultifiedRating, rating: existing.rating } : vaultifiedRating;
                    handleUpdateSessionData({ ratings: [ratingToSave, ...filtered] });
                  }}
                  contrastColor={uiContrastColor}
                  globalColor={currentBackgroundColor}
                />
              </div>
            )}

            <div className={currentTab === 'rate' ? 'h-full' : 'hidden'}>
              <RatingsPage 
                activeComic={activeComic}
                allComics={comics}
                ratings={ratings}
                onUpdateRating={(id, rating) => {
                  const updated = (activeSession.data.ratings || []).map(r => r.id === id ? { ...r, rating } : r);
                  handleUpdateSessionData({ ratings: updated });
                }}
                onDeleteRating={(id) => {
                  const updated = (activeSession.data.ratings || []).filter(r => r.id !== id);
                  handleUpdateSessionData({ ratings: updated });
                }}
                onPreviewImage={setPreviewImage}
                contrastColor={uiContrastColor}
                globalColor={currentBackgroundColor}
              />
            </div>
          </div>
        </main>
      </div>

      <GuideBuddy 
        enabled={currentUser?.guideEnabled || false}
        currentStepIndex={currentGuideStep}
        onNext={() => handleUpdateSessionData({ currentGuideStep: currentGuideStep + 1 })}
        onPrev={() => handleUpdateSessionData({ currentGuideStep: Math.max(0, currentGuideStep - 1) })}
        onClose={toggleGuide}
      />

      {isProfileOpen && (
        <ProfileModal 
          user={currentUser} 
          onUpdate={handleAuth} 
          onLogout={handleLogout} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}

      {isNamingNewSeries && (
        <div className="fixed inset-0 z-[3000] modal-backdrop flex items-center justify-center p-6" onClick={() => setIsNamingNewSeries(false)}>
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl font-header uppercase tracking-widest mb-6 text-slate-800">New Production</h3>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Series Name</label>
            <input 
              autoFocus
              type="text" 
              value={newSeriesName} 
              onChange={e => setNewSeriesName(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleConfirmCreateSeries()}
              placeholder="e.g. Neo Tokyo 2099" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold mb-8 outline-none focus:ring-4 focus:ring-black/5"
            />
            <div className="flex gap-4">
               <button onClick={() => setIsNamingNewSeries(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
               <button onClick={handleConfirmCreateSeries} className="flex-1 bg-slate-800 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-900">Initialize</button>
            </div>
          </div>
        </div>
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

      {previewImage && (
        <div className="fixed inset-0 z-[2000] modal-backdrop flex items-center justify-center p-12 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-8xl max-h-full">
            <img src={resolvedPreviewImage || null} className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.4)] border-[12px] border-white animate-in zoom-in-95" onClick={(e) => e.stopPropagation()} />
            <button className="absolute -top-6 -right-6 bg-slate-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-all shadow-2xl" onClick={() => setPreviewImage(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {readModePages && activeBook && (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center overflow-hidden animate-in fade-in duration-500" style={{ backgroundColor: currentBackgroundColor }}>
          <div className="w-full bg-white/80 backdrop-blur-xl border-b border-black/5 px-10 py-4 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-6">
                <i className="fa-solid fa-book-open text-slate-800 text-2xl"></i>
                <h2 className="text-slate-800 font-comic text-3xl tracking-widest uppercase">{activeBook.title}</h2>
                <div className="px-3 py-1 bg-slate-800 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                  {readModePages.mode === 'clean' ? 'Clean Edition' : 'Standard Edition'}
                </div>
             </div>
             <button onClick={() => setReadModePages(null)} className="text-slate-500 text-4xl hover:text-white transition-all">×</button>
          </div>
          <div className="flex-1 w-full overflow-y-auto pb-96 space-y-60 py-32 px-10">
            {activeBook.coverImageUrl && (
              <div className="max-w-5xl mx-auto flex flex-col items-center">
                <CachedImage src={activeBook.coverImageUrl} className="w-full rounded-[2rem] shadow-2xl border-[8px] border-white" />
              </div>
            )}
            {readModePages.pages.map((page, idx) => (
              <div key={page.id} className="flex flex-col items-center space-y-8 max-w-6xl mx-auto">
                <div className="w-full flex justify-between items-center text-slate-500 font-black uppercase text-[10px] tracking-widest">
                  <span>PAGE {idx + 1}</span>
                  <span className="opacity-30">{page.arTargetId}</span>
                </div>
                <CachedImage 
                  src={readModePages.mode === 'clean' ? (page.exportImageUrl || page.finishedImageUrl) : page.finishedImageUrl} 
                  className="w-full rounded-[2rem] shadow-2xl border-[8px] border-white" 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
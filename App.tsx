import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './services/firebase';
import { Login } from './components/Login';
import { ComicBookEditor } from './components/ComicBookEditor';
import { Comic, ComicProfile, GeneratedPanel, User, AppSession, ProjectState, SavedComicStrip, ComicBook } from './types';
import { generateComicScript, generateComicArt, removeTextFromComic, generateVeoVideo, setGeminiApiKey } from './services/gemini';
import { TrainingCenter } from './components/TrainingCenter';
import { BooksLibrary } from './components/BooksLibrary';
import { Header } from './components/Header';
import { GuideBuddy } from './components/GuideBuddy';
import { ProfileModal } from './components/ProfileModal';
import { imageStore } from './services/imageStore';

// Debounce helper
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [comics, setComics] = useState<Comic[]>([]);
  const [comicProfiles, setComicProfiles] = useState<ComicProfile[]>([]);
  const [books, setBooks] = useState<ComicBook[]>([]);
  const [history, setHistory] = useState<SavedComicStrip[]>([]);
  
  const [editingComic, setEditingComic] = useState<ComicProfile | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'comic-view' | 'comic-edit'>('gallery');
  const [activeComic, setActiveComic] = useState<Comic | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [guideStep, setGuideStep] = useState(0);

  const session: AppSession = {
    id: 'live-session',
    userId: user?.id || '',
    name: 'Cloud Workspace',
    lastModified: Date.now(),
    data: {
      version: '1.0',
      comics: comicProfiles,
      history: history,
      bookPages: [],
      books: books,
      timestamp: Date.now(),
      globalBackgroundColor: editingComic?.backgroundColor || '#1E293B',
      activeSeriesId: editingComic?.id || null
    }
  };

  const globalColor = editingComic?.backgroundColor || '#1E293B';
  const contrastColor = '#ffffff';

  // --- Auth & Initial Load ---
  useEffect(() => {
    const handleApiError = (event: CustomEvent) => {
      setGlobalError(event.detail.message);
    };
    window.addEventListener('gemini-api-error', handleApiError as EventListener);
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Load initial user state (could be from Firestore if we saved profile before)
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || '',
          apiKeys: {}
        };
        setUser(userData);
      } else {
        setUser(null);
        setComics([]);
        setComicProfiles([]);
        setBooks([]);
        setHistory([]);
      }
      setIsLoading(false);
    });

    return () => {
      window.removeEventListener('gemini-api-error', handleApiError as EventListener);
      unsubscribe();
    };
  }, []);

  // Sync Gemini API Key whenever the user object changes
  useEffect(() => {
      if (user?.apiKeys?.gemini) {
          setGeminiApiKey(user.apiKeys.gemini);
      }
  }, [user]);

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (!user) return;

    const profilesUnsub = onSnapshot(query(collection(db, "comic_profiles"), where("uid", "==", user.id)), (snapshot) => {
      const data: ComicProfile[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as ComicProfile));
      setComicProfiles(data);
    });

    const comicsUnsub = onSnapshot(query(collection(db, "comics"), where("uid", "==", user.id)), (snapshot) => {
      const data: Comic[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Comic));
      setComics(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    const booksUnsub = onSnapshot(query(collection(db, "books"), where("uid", "==", user.id)), (snapshot) => {
        const data: ComicBook[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as ComicBook));
        setBooks(data);
    });

    return () => {
        profilesUnsub();
        comicsUnsub();
        booksUnsub();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login failed:", error);
      setGlobalError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
      // Optional: Persistent saving of user profile to Firestore could happen here
  };

  const handleCreateNewComic = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const newProfile: Omit<ComicProfile, 'id'> = {
        uid: user.id,
        name: "New Series",
        styleDescription: "Describe the style...",
        artStyle: 'gemini-3.1-flash-image-preview',
        characters: [],
        environments: [],
        panelCount: 3,
        environment: "Default",
        createdAt: new Date()
      } as any;
      
      const profileRef = await addDoc(collection(db, "comic_profiles"), newProfile);
      const profileWithId = { id: profileRef.id, ...newProfile } as ComicProfile;

      const newBook: Omit<ComicBook, 'id'> = {
          uid: user.id,
          title: "Vol. 1",
          description: "First volume",
          pages: [],
          timestamp: Date.now(),
          width: 1200,
          height: 1800,
          externalPageUrls: [],
          showPageNumbers: true,
          pageNumberPosition: 'bottom'
      } as any;
      
      await addDoc(collection(db, "books"), newBook);

      setEditingComic(profileWithId);
      setViewMode('comic-edit');
    } catch (error) {
      console.error("Failed to create:", error);
      setGlobalError("Failed to create new series.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComic = (profile: ComicProfile) => {
    setEditingComic(profile);
    setViewMode('comic-edit');
  };

  const handleViewComic = (comic: Comic) => {
    setActiveComic(comic);
    setViewMode('comic-view');
  };

  const handleDeleteProfile = async (id: string) => {
      if(!confirm("Delete this series?")) return;
      await deleteDoc(doc(db, "comic_profiles", id));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900"><i className="fa-solid fa-spinner fa-spin text-4xl text-white"></i></div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50" style={{ backgroundColor: globalColor }}>
      <Header 
        user={user}
        session={session}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSessions={() => {}}
        isSaving={isSyncing}
        onManualSync={() => {}}
        onBack={viewMode !== 'gallery' ? () => setViewMode('gallery') : undefined}
        contrastColor={contrastColor}
        guideEnabled={true}
        onToggleGuide={() => {}}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {viewMode === 'gallery' && (
          <BooksLibrary 
            comics={comicProfiles}
            books={books}
            history={history}
            onOpenBook={(id) => {
                const profile = comicProfiles.find(p => p.id === id);
                if (profile) handleEditComic(profile);
            }}
            onCreateComic={handleCreateNewComic}
            onDeleteComic={() => {}}
            onDeleteProfile={handleDeleteProfile}
            onClearHistory={() => {}}
            onSyncLibrary={() => {}}
            activeSeriesId={null}
            onEditComic={handleEditComic}
            onViewComic={handleViewComic}
          />
        )}

        {viewMode === 'comic-edit' && editingComic && (
          <TrainingCenter 
            editingComic={editingComic}
            onUpdateComic={async (updated) => {
                setEditingComic(updated);
                const { id, ...data } = updated;
                setIsSyncing(true);
                await updateDoc(doc(db, "comic_profiles", id), data);
                setIsSyncing(false);
            }}
            onPreviewImage={setPreviewImageUrl}
            globalColor={globalColor}
            onUpdateGlobalColor={(c) => {}}
            contrastColor={contrastColor}
            onAdvanceGuide={setGuideStep}
          />
        )}
      </main>

      {globalError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-2xl animate-bounce z-50">
          <p className="font-bold">Error</p>
          <p className="text-sm">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="absolute top-1 right-2 text-white/50 hover:text-white">&times;</button>
        </div>
      )}

      {isProfileOpen && (
        <ProfileModal 
            user={user} 
            onUpdate={handleUpdateUser} 
            onLogout={handleLogout} 
            onClose={() => setIsProfileOpen(false)} 
        />
      )}

      {previewImageUrl && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-10" onClick={() => setPreviewImageUrl(null)}>
             <img src={previewImageUrl} className="max-w-full max-h-full rounded-xl shadow-2xl" />
         </div>
      )}

      <GuideBuddy 
        enabled={true}
        currentStepIndex={guideStep}
        onNext={() => setGuideStep(s => s + 1)}
        onPrev={() => setGuideStep(s => s - 1)}
        onClose={() => {}}
      />
    </div>
  );
}

export default App;
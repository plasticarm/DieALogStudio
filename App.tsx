import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './services/firebase';
import { Login } from './components/Login';
import { ComicBookEditor } from './components/ComicBookEditor';
import { Comic, ComicProfile, GeneratedPanel, User, AppSession, ProjectState, SavedComicStrip, ComicBook } from './types';
import { generateComicScript, generateComicArt, removeTextFromComic, generateVeoVideo } from './services/gemini';
import { TrainingCenter } from './components/TrainingCenter';
import { BooksLibrary } from './components/BooksLibrary';
import { Header } from './components/Header';
import { GuideBuddy } from './components/GuideBuddy';
import { ImagePreview } from './components/ImagePreview'; // Assuming this file exists now or will be restored
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
  
  // Consolidated State (Simulating the Session structure for compatibility)
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

  // Construct a derived session object for the Header
  const session: AppSession = {
    id: 'live-session',
    userId: user?.id || '',
    name: 'Cloud Workspace',
    lastModified: Date.now(),
    data: {
      version: '1.0',
      comics: comicProfiles,
      history: history,
      bookPages: [], // Not currently syncing
      books: books,
      timestamp: Date.now(),
      globalBackgroundColor: editingComic?.backgroundColor || '#1E293B',
      activeSeriesId: editingComic?.id || null
    }
  };

  const globalColor = editingComic?.backgroundColor || '#1E293B';
  const contrastColor = '#ffffff'; // Simplified contrast logic for now

  // --- Auth & Initial Load ---
  useEffect(() => {
    const handleApiError = (event: CustomEvent) => {
      setGlobalError(event.detail.message);
    };
    window.addEventListener('gemini-api-error', handleApiError as EventListener);
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || '',
          apiKeys: {}
        });
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

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (!user) return;

    // Sync Profiles
    const profilesUnsub = onSnapshot(query(collection(db, "comic_profiles"), where("uid", "==", user.id)), (snapshot) => {
      const data: ComicProfile[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as ComicProfile));
      setComicProfiles(data);
    });

    // Sync Comics (Strips)
    const comicsUnsub = onSnapshot(query(collection(db, "comics"), where("uid", "==", user.id)), (snapshot) => {
      const data: Comic[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Comic));
      setComics(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    // Sync Books (Volumes) - Assuming a 'books' collection exists or using profiles as proxy
    // For now, let's assume one book per profile for simplicity if 'books' collection is empty
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


  // --- Actions ---

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

  const handleCreateNewComic = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Create Profile
      const newProfile: Omit<ComicProfile, 'id'> = {
        uid: user.id, // Ensure this field exists in your Firestore type definition
        name: "New Series",
        styleDescription: "Describe the style...",
        artStyle: 'gemini-3.1-flash-image-preview',
        characters: [],
        environments: [],
        panelCount: 3,
        createdAt: new Date()
      } as any; // Cast to any to bypass strict type check for now if 'uid' is missing in type
      
      const profileRef = await addDoc(collection(db, "comic_profiles"), newProfile);
      const profileWithId = { id: profileRef.id, ...newProfile } as ComicProfile;

      // 2. Create corresponding Book
      const newBook: Omit<ComicBook, 'id'> = {
          uid: user.id, // Add uid to book for querying
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
      
      await addDoc(collection(db, "books"), newBook); // Assuming 'books' collection

      setEditingComic(profileWithId);
      setViewMode('comic-edit'); // Go to Genome/Edit
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
      // Implementation for deleting profile and related comics/books
      await deleteDoc(doc(db, "comic_profiles", id));
      // Should also delete associated comics and books ideally
  };

  // --- Rendering ---

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
        onOpenProfile={() => {}}
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
            onDeleteComic={() => {}} // Implement delete
            onDeleteProfile={handleDeleteProfile}
            onClearHistory={() => {}}
            onSyncLibrary={() => {}}
            activeSeriesId={null}
            onEditComic={handleEditComic} // Make sure this is passed if BooksLibrary uses it
            onViewComic={handleViewComic} // Make sure this is passed if BooksLibrary uses it
          />
        )}

        {viewMode === 'comic-edit' && editingComic && (
          <TrainingCenter 
            editingComic={editingComic}
            onUpdateComic={async (updated) => {
                // Update local state immediately for responsiveness
                setEditingComic(updated);
                // Sync to Firestore
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

        {/* Restore other views like ComicBookEditor (Binder) and ComicGenerator (Studio) here if needed */}
      </main>

      {globalError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-2xl animate-bounce z-50">
          <p className="font-bold">Error</p>
          <p className="text-sm">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="absolute top-1 right-2 text-white/50 hover:text-white">&times;</button>
        </div>
      )}

      {/* Image Preview Overlay */}
      {previewImageUrl && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-10" onClick={() => setPreviewImageUrl(null)}>
             <img src={previewImageUrl} className="max-w-full max-h-full rounded-xl shadow-2xl" />
         </div>
      )}

      <GuideBuddy 
        user={user}
        currentStep={guideStep}
        onStepComplete={(step) => setGuideStep(step + 1)}
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
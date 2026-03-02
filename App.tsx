import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './services/firebase';
import { Login } from './components/Login';
import { ComicBookEditor } from './components/ComicBookEditor';
import { Comic, ComicProfile, GeneratedPanel, User } from './types';
import { generateComicScript, generateComicArt, removeTextFromComic, generateVeoVideo } from './services/gemini';
import { TrainingCenter } from './components/TrainingCenter';
import { BooksLibrary } from './components/BooksLibrary';
import { Header } from './components/Header';
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
  const [comics, setComics] = useState<Comic[]>([]);
  const [comicProfiles, setComicProfiles] = useState<ComicProfile[]>([]);
  const [editingComic, setEditingComic] = useState<ComicProfile | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'comic-view' | 'comic-edit'>('gallery');
  const [activeComic, setActiveComic] = useState<Comic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [guideStep, setGuideStep] = useState(0);

  const globalColor = editingComic?.backgroundColor || '#1E293B';
  const contrastColor = '#ffffff';

  const activeComicRef = useRef(activeComic);
  useEffect(() => {
    activeComicRef.current = activeComic;
  }, [activeComic]);

  useEffect(() => {
    const handleApiError = (event: CustomEvent) => {
      setGlobalError(event.detail.message);
    };

    window.addEventListener('gemini-api-error', handleApiError as EventListener);
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
        };
        setUser(userData);
        setIsLoading(false);
      } else {
        setUser(null);
        setComics([]);
        setComicProfiles([]);
        setIsLoading(false);
      }
    });

    return () => {
      window.removeEventListener('gemini-api-error', handleApiError as EventListener);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "comics"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const comicsData: Comic[] = [];
      querySnapshot.forEach((doc) => {
        comicsData.push({ id: doc.id, ...doc.data() } as Comic);
      });
      setComics(comicsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "comic_profiles"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const profilesData: ComicProfile[] = [];
      querySnapshot.forEach((doc) => {
        profilesData.push({ id: doc.id, ...doc.data() } as ComicProfile);
      });
      setComicProfiles(profilesData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      setGlobalError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const debouncedUpdateComicProfile = useCallback(
    debounce(async (profile: ComicProfile) => {
      if (!user) return;
      setIsSyncing(true);
      try {
        const { id, ...data } = profile;
        await updateDoc(doc(db, "comic_profiles", id), data);
      } catch (error) {
        console.error("Failed to update comic profile:", error);
        setGlobalError("Failed to save your changes. Please check your connection.");
      } finally {
        setTimeout(() => setIsSyncing(false), 1000);
      }
    }, 1000),
    [user]
  );
  
  const handleUpdateComicProfile = (updatedProfile: ComicProfile) => {
    setEditingComic(updatedProfile);
    debouncedUpdateComicProfile(updatedProfile);
  };

  const handleCreateNewComic = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const newProfile: Omit<ComicProfile, 'id'> = {
        uid: user.uid,
        name: "My New Comic Series",
        styleDescription: "A vibrant and energetic comic book style.",
        artStyle: 'gemini-3.1-flash-image-preview',
        characters: [],
        environments: [],
        createdAt: new Date()
      };
      const docRef = await addDoc(collection(db, "comic_profiles"), newProfile);
      setEditingComic({ id: docRef.id, ...newProfile });
      setViewMode('comic-edit');
    } catch (error) {
      console.error("Failed to create new comic series:", error);
      setGlobalError('Could not create a new series. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComicProfile = async (profileId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this entire series and all its comics? This cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Batch delete all comics associated with the profile
      const comicsQuery = query(collection(db, "comics"), where("profileId", "==", profileId));
      const comicsSnapshot = await getDocs(comicsQuery);
      const batch = writeBatch(db);
      comicsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete the profile itself
      await deleteDoc(doc(db, "comic_profiles", profileId));

      setViewMode('gallery');
      setEditingComic(null);

    } catch (error) {
      console.error("Error deleting comic series:", error);
      setGlobalError("There was an issue deleting this series. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (profile: ComicProfile, prompt: string, isRandom: boolean, panelCount: number) => {
    if (!user || !profile) return;
    
    const newComic: Omit<Comic, 'id'> = {
      uid: user.uid,
      profileId: profile.id,
      prompt: prompt,
      status: 'generating-script',
      panels: [],
      createdAt: new Date(),
    };

    let newComicId = '';
    try {
      const docRef = await addDoc(collection(db, "comics"), newComic);
      newComicId = docRef.id;
      setActiveComic({ id: newComicId, ...newComic });
      setViewMode('comic-view');

      const script = await generateComicScript(profile, prompt, isRandom, panelCount);
      await updateDoc(doc(db, "comics", newComicId), { 
        status: 'generating-art',
        panels: script.map(p => ({ ...p, status: 'pending' }))
      });
      
      const art = await generateComicArt(profile, script, profile.artStyle as any);
      const storageRef = ref(storage, `${user.uid}/${newComicId}/strip.png`);
      const blob = await (await fetch(art)).blob();
      await uploadBytes(storageRef, blob);
      const artUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "comics", newComicId), { status: 'completed', artUrl });
      
    } catch (error: any) {
      console.error("Generation failed:", error);
      setGlobalError(error.message || "An unknown error occurred during generation.");
      if (newComicId) {
        await updateDoc(doc(db, "comics", newComicId), { status: 'failed' });
      }
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

  const handleBackToGallery = () => {
    setViewMode('gallery');
    setActiveComic(null);
    setEditingComic(null);
  };
  
  const handleRegenerateArt = async () => {
    if (!activeComic || !user) return;
    
    const comicId = activeComic.id;
    const profile = comicProfiles.find(p => p.id === activeComic.profileId);
    if (!profile) return;

    try {
      await updateDoc(doc(db, "comics", comicId), { status: 'generating-art' });
      
      const art = await generateComicArt(profile, activeComic.panels, profile.artStyle as any);
      const storageRef = ref(storage, `${user.uid}/${comicId}/strip.png`);
      const blob = await (await fetch(art)).blob();
      await uploadBytes(storageRef, blob);
      const artUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "comics", comicId), { status: 'completed', artUrl });

    } catch (error: any) {
      console.error("Art regeneration failed:", error);
      setGlobalError(error.message || "An unknown error occurred during art regeneration.");
      await updateDoc(doc(db, "comics", comicId), { status: 'failed' });
    }
  };

  const handleClearText = async () => {
    if (!activeComic?.artUrl) return;

    try {
        const comicId = activeComic.id;
        await updateDoc(doc(db, "comics", comicId), { status: 'clearing-text' });

        const clearedArt = await removeTextFromComic(activeComic.artUrl, editingComic?.artStyle as any);
        
        const storageRef = ref(storage, `${user.uid}/${comicId}/strip_textless.png`);
        const blob = await (await fetch(clearedArt)).blob();
        await uploadBytes(storageRef, blob);
        const textlessArtUrl = await getDownloadURL(storageRef);
        
        await updateDoc(doc(db, "comics", comicId), { status: 'completed', textlessArtUrl: textlessArtUrl });

    } catch(e: any) {
        console.error("Failed to clear text", e);
        setGlobalError(e.message || "Failed to clear text from the comic.");
        if (activeComic?.id) {
            await updateDoc(doc(db, "comics", activeComic.id), { status: 'failed' });
        }
    }
  }

  const handleGenerateVideo = async () => {
    if (!activeComic?.artUrl) return;
    const comicId = activeComic.id;
    try {
      await updateDoc(doc(db, "comics", comicId), { status: 'generating-video' });
      const videoUrl = await generateVeoVideo(activeComic.artUrl, 'veo-3.1-fast-generate-preview', (progress) => {
         updateDoc(doc(db, "comics", comicId), { videoGenerationProgress: progress });
      });

      const storageRef = ref(storage, `${user.uid}/${comicId}/video.mp4`);
      const blob = await (await fetch(videoUrl)).blob();
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, "comics", comicId), { status: 'completed', videoUrl: downloadUrl, videoGenerationProgress: 'Done' });

    } catch(e:any) {
       console.error("Failed to generate video", e);
       setGlobalError(e.message || "Failed to generate video.");
        if (activeComic?.id) {
            await updateDoc(doc(db, "comics", activeComic.id), { status: 'failed' });
        }
    }
  }

  const handleDeleteComic = async (comicId: string) => {
    if (!window.confirm("Are you sure you want to delete this comic?")) return;
    try {
      await deleteDoc(doc(db, "comics", comicId));
      if (activeComic?.id === comicId) {
        handleBackToGallery();
      }
    } catch (error) {
      console.error("Failed to delete comic:", error);
      setGlobalError("Failed to delete comic. Please try again.");
    }
  };

  const handleUpdateComicPanels = async (comicId: string, panels: GeneratedPanel[]) => {
      try {
        await updateDoc(doc(db, "comics", comicId), { panels: panels });
      } catch(e: any) {
        console.error("Failed to update panels:", e);
        setGlobalError("Failed to update comic panels. Please try again.");
      }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-screen"><i className="fa-solid fa-spinner-third animate-spin text-4xl"></i></div>;
    }

    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    if (viewMode === 'gallery') {
      return (
        <BooksLibrary
          comicProfiles={comicProfiles}
          comics={comics}
          onNewComic={handleCreateNewComic}
          onEditComic={handleEditComic}
          onViewComic={handleViewComic}
          onDeleteComic={handleDeleteComic}
          onDeleteProfile={handleDeleteComicProfile}
          onAdvanceGuide={setGuideStep}
        />
      );
    }

    if (viewMode === 'comic-view' && activeComic) {
      const profile = comicProfiles.find(p => p.id === activeComic.profileId);
      return (
        <ComicBookEditor
          comic={activeComic}
          profile={profile}
          onRegenerate={handleRegenerateArt}
          onClearText={handleClearText}
          onGenerateVideo={handleGenerateVideo}
          onUpdatePanels={handleUpdateComicPanels}
          onAdvanceGuide={setGuideStep}
        />
      );
    }

    if (viewMode === 'comic-edit' && editingComic) {
      return (
        <TrainingCenter
          editingComic={editingComic}
          onUpdateComic={handleUpdateComicProfile}
          onPreviewImage={setPreviewImageUrl}
          globalColor={globalColor}
          onUpdateGlobalColor={(color) => handleUpdateComicProfile({ ...editingComic, backgroundColor: color })}
          contrastColor={contrastColor}
          onAdvanceGuide={setGuideStep}
        />
      );
    }

    // Fallback if state is inconsistent
    if (viewMode !== 'gallery') {
      handleBackToGallery();
    }
    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-800" style={{ backgroundColor: globalColor }}>
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onBack={viewMode !== 'gallery' ? handleBackToGallery : undefined}
        isSyncing={isSyncing}
        contrastColor={contrastColor}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>

      {globalError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl animate-bounce">
          <p className='font-bold'>Error</p>
          <p>{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="absolute top-1 right-2 text-white font-bold">&times;</button>
        </div>
      )}
      
    </div>
  );
}

export default App;

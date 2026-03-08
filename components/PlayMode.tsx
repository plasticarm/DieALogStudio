import React, { useState, useEffect, useRef } from 'react';
import { RatedComic, SavedComicStrip, ComicProfile, TextField, ComicBook, User } from '../types';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { CachedImage } from './CachedImage';
import { imageStore } from '../services/imageStore';
import { downscaleImage } from '../utils/imageUtils';
import { generateVeoVideo } from '../services/gemini';
import { COMIC_FONTS, GENRES } from '../constants';
import Pusher from 'pusher-js';

const getFontFamily = (fontName: string) => {
  const font = COMIC_FONTS.find(f => f.name === fontName);
  return font ? font.family : 'Inter, sans-serif';
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const AutoResizingText: React.FC<{ text: string, alignment: string, font: string }> = ({ text, alignment, font }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adjustFontSize = () => {
      if (container.clientWidth === 0 || container.clientHeight === 0) return;

      let currentSize = 100;
      container.style.fontSize = `${currentSize}px`;
      container.style.fontFamily = getFontFamily(font);

      while (
        (container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth) &&
        currentSize > 8
      ) {
        currentSize -= 1;
        container.style.fontSize = `${currentSize}px`;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      adjustFontSize();
    });

    resizeObserver.observe(container);
    adjustFontSize();
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [text, font, alignment]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center break-words whitespace-pre-wrap overflow-hidden"
      style={{ 
        textAlign: alignment as any,
        padding: '6%',
        lineHeight: 0.8,
      }}
    >
      {text}
    </div>
  );
};

const EditableBubble: React.FC<{ 
  text: string, 
  alignment: string, 
  font: string, 
  onChange: (text: string) => void 
}> = ({ text, alignment, font, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && containerRef.current.innerText !== text) {
      // Only update if not currently focused to avoid cursor jump
      if (document.activeElement !== containerRef.current) {
        containerRef.current.innerText = text;
      }
    }
  }, [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adjustFontSize = () => {
      if (container.clientWidth === 0 || container.clientHeight === 0) return;

      let currentSize = 100;
      container.style.fontSize = `${currentSize}px`;
      container.style.fontFamily = getFontFamily(font);

      while (
        (container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth) &&
        currentSize > 8
      ) {
        currentSize -= 1;
        container.style.fontSize = `${currentSize}px`;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      adjustFontSize();
    });

    resizeObserver.observe(container);
    adjustFontSize();
    
    // Also adjust on input
    container.addEventListener('input', adjustFontSize);
    
    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('input', adjustFontSize);
    };
  }, [font, alignment]); // removed text dependency so it doesn't re-run on every keystroke

  return (
    <div 
      ref={containerRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        onChange(e.currentTarget.innerText);
      }}
      className="w-full h-full flex items-center justify-center break-words whitespace-pre-wrap overflow-hidden outline-none focus:ring-4 focus:ring-amber-600/50 rounded-xl bg-white/20 hover:bg-white/40 focus:bg-white/80 transition-all cursor-text shadow-inner"
      style={{ 
        textAlign: alignment as any,
        padding: '6%',
        lineHeight: 0.8,
      }}
    />
  );
};

interface PlayModeProps {
  user: User;
  ratings: RatedComic[];
  history: SavedComicStrip[];
  comics: ComicProfile[];
  books: ComicBook[];
  binderPages: string[];
  onExit: () => void;
  onAddSubmission: (submission: RatedComic) => void;
  onEdit?: () => void;
}

export const PlayMode: React.FC<PlayModeProps> = ({ user, ratings, history, comics, books, binderPages, onExit, onAddSubmission, onEdit }) => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('room-update', (updatedRoom) => {
      setRoom(updatedRoom);
      
      const me = updatedRoom.players.find((p: any) => p.id === user.id);
      if (me && me.role) {
        setRole(me.role);
      }

      // Sync submissions
      if (updatedRoom.submissions) {
        setSubmittedComics(updatedRoom.submissions);
        if (updatedRoom.submissions.length === 0) {
          setHasSubmitted(false);
          setUsedHints(new Set());
        }
      }

      setWinner(updatedRoom.winner || null);

      if (updatedRoom.previewImage !== undefined) {
        setPreviewImage(updatedRoom.previewImage);
      }

      if (updatedRoom.gameState === 'playing' && (updatedRoom.activeStripId || updatedRoom.activeStrip)) {
        const strip = updatedRoom.activeStrip || history.find(h => h.id === updatedRoom.activeStripId);
        if (strip) {
          setActiveStrip(strip);
          const profile = comics.find(c => c.id === strip.comicProfileId);
          const primaryFont = profile?.selectedFonts?.[0] || 'Amatic SC';
          setLocalTextFields((strip.textFields || []).map(tf => ({ ...tf, text: '', font: primaryFont })));
          setSelectedComic({
            id: `temp_${strip.id}`,
            comicProfileId: strip.comicProfileId,
            stripId: strip.id,
            imageUrl: strip.exportImageUrl || strip.finishedImageUrl,
            rating: 0,
            timestamp: Date.now(),
            name: strip.name
          });
        }
      } else if (updatedRoom.gameState === 'playing' && !updatedRoom.activeStripId && !updatedRoom.activeStrip) {
        setSelectedComic(null);
        setActiveStrip(null);
        setLocalTextFields([]);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setRoom(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Check for room code in URL
    const params = new URLSearchParams(window.location.search);
    const urlRoomCode = params.get('game');
    if (urlRoomCode) {
      setRoomCode(urlRoomCode);
      newSocket.emit('join-room', { roomCode: urlRoomCode, user });
    }

    return () => {
      newSocket.disconnect();
    };
  }, [user, history, comics]);

  const handleCreateGame = async () => {
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostUser: user }),
      });

      const roomData = await response.json();
      setRoomCode(roomData.roomCode);
      setRoom(roomData);

      // Join the socket room
      socket?.emit('join-room', { roomCode: roomData.roomCode, user });

      // Update URL without reload
      const newUrl = `${window.location.origin}${window.location.pathname}?game=${roomData.roomCode}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (error) {
      console.error("Room creation failed:", error);
    }
  };
  
  const handleJoinGame = () => {
    if (!joinCodeInput) return;
    const code = joinCodeInput.toUpperCase();
    setRoomCode(code);
    socket?.emit('join-room', { roomCode: code, user });
    const newUrl = `${window.location.origin}${window.location.pathname}?game=${code}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleStartGame = () => {
    if (!roomCode || room?.host !== user?.id) return;
    
    const updatedPlayers = room.players.map((p: any) => ({
      ...p,
      role: p.id === user.id ? 'judge' : 'writer'
    }));

    socket?.emit('update-game-state', { 
      roomCode, 
      newState: { 
        gameState: 'playing',
        players: updatedPlayers,
        timeLimit,
        pointsToWin,
        scores: room.players.reduce((acc: any, p: any) => ({ ...acc, [p.id]: 0 }), {}),
        branches: room.players.reduce((acc: any, p: any) => ({ ...acc, [p.id]: 30 }), {}),
        winningComics: []
      } 
    });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?game=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!winner) return;
    
    const shareText = "Check out the comic I created for DiE-A-Log";
    const shareUrl = window.location.origin;

    // Try Web Share API first (best for mobile/apps)
    if (navigator.share) {
      try {
        // If the image is base64, try to convert to file for sharing
        let files: File[] = [];
        if (winner.imageUrl.startsWith('data:')) {
          const response = await fetch(winner.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'comic.png', { type: 'image/png' });
          files = [file];
        }

        const shareData: ShareData = {
          title: 'DiE-A-Log Comic',
          text: shareText,
          url: shareUrl,
        };

        // Only add files if supported
        if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
          shareData.files = files;
        }

        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('Share failed:', err);
      }
    }

    // Fallback: Show custom share menu or just open X/FB
    setIsSharing(true);
  };

  const shareToSocial = (platform: 'x' | 'facebook') => {
    const text = "Check out the comic I created for DiE-A-Log";
    const url = window.location.origin;
    
    let shareUrl = '';
    if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    
    window.open(shareUrl, '_blank');
    setIsSharing(false);
  };

  const [role, setRole] = useState<'select' | 'judge' | 'writer'>('select');
  const [judgeImage, setJudgeImage] = useState<string>('');
  const [writerImage, setWriterImage] = useState<string>('');

  useEffect(() => {
    const judges = ['judge_bf1.png', 'judge_wf1.png', 'judge_wm1.png', 'judge_wm2.png', 'judge_wm3.png', 'judge_wm4.png'];
    const writers = ['writer_wf1.png', 'writer_wf2.png', 'writer_wf3.png', 'writer_wm1.png', 'writer_wm2.png', 'writer_wm3.png', 'writer_wm4.png', 'writer_wm5.png'];
    
    const randomJudge = judges[Math.floor(Math.random() * judges.length)];
    const randomWriter = writers[Math.floor(Math.random() * writers.length)];
    
    setJudgeImage(`https://raw.githubusercontent.com/plasticarm/DieALogStudio/2f03333fc653eaf32446fa821b5e1aab598550ac/images/gameCharacters/judge/${randomJudge}`);
    setWriterImage(`https://raw.githubusercontent.com/plasticarm/DieALogStudio/2f03333fc653eaf32446fa821b5e1aab598550ac/images/gameCharacters/writers/${randomWriter}`);
  }, []);
  const [selectedComic, setSelectedComic] = useState<RatedComic | null>(null);
  const [submittedComics, setSubmittedComics] = useState<RatedComic[]>([]);
  const [winner, setWinner] = useState<RatedComic | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resolvedPreviewImage, setResolvedPreviewImage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [localTextFields, setLocalTextFields] = useState<TextField[]>([]);
  const [usedHints, setUsedHints] = useState<Set<string>>(new Set());
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [activeStrip, setActiveStrip] = useState<SavedComicStrip | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [preGameState, setPreGameState] = useState<'none' | 'cover' | 'go'>('none');

  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>(GENRES.map(g => g.id));

  // Filter binderPages to only those present in history to avoid dead links
  const validBinderPages = React.useMemo(() => {
    return binderPages.filter(id => history.some(h => h.id === id));
  }, [binderPages, history]);

  const filteredBinderPages = React.useMemo(() => {
    return validBinderPages.filter(id => {
      const strip = history.find(h => h.id === id);
      const profile = comics.find(c => c.id === strip?.comicProfileId);
      return profile && selectedGenreIds.includes(profile.category);
    });
  }, [validBinderPages, history, comics, selectedGenreIds]);

  const filteredRatings = React.useMemo(() => {
    return ratings.filter(r => {
      const strip = history.find(h => h.id === r.stripId);
      const profile = comics.find(c => c.id === strip?.comicProfileId);
      return profile && selectedGenreIds.includes(profile.category);
    });
  }, [ratings, history, comics, selectedGenreIds]);

  // Deck States
  const [writerDeck, setWriterDeck] = useState<string[]>([]);
  const [judgeDeck, setJudgeDeck] = useState<string[]>([]);
  const lastWriterPool = useRef<string[]>([]);
  const lastJudgePool = useRef<string[]>([]);
  const lastPickedWriterId = useRef<string | null>(null);
  const lastPickedJudgeId = useRef<string | null>(null);

  // Initialize/Shuffle Decks
  useEffect(() => {
    if (filteredBinderPages.length > 0) {
      const poolChanged = lastWriterPool.current.length !== filteredBinderPages.length || 
                          lastWriterPool.current.some(id => !filteredBinderPages.includes(id));
      
      if (writerDeck.length === 0 || poolChanged) {
        let newDeck = shuffleArray([...filteredBinderPages]);
        // Avoid immediate repeat if possible
        if (newDeck.length > 1 && newDeck[newDeck.length - 1] === lastPickedWriterId.current) {
          // Swap last with first
          [newDeck[0], newDeck[newDeck.length - 1]] = [newDeck[newDeck.length - 1], newDeck[0]];
        }
        setWriterDeck(newDeck);
        lastWriterPool.current = [...filteredBinderPages];
      }
    } else {
      setWriterDeck([]);
      lastWriterPool.current = [];
    }
  }, [filteredBinderPages, writerDeck.length]);

  useEffect(() => {
    const ratingIds = filteredRatings.map(r => r.id);
    if (ratingIds.length > 0) {
      const poolChanged = lastJudgePool.current.length !== ratingIds.length || 
                          lastJudgePool.current.some(id => !ratingIds.includes(id));
      
      if (judgeDeck.length === 0 || poolChanged) {
        let newDeck = shuffleArray([...ratingIds]);
        // Avoid immediate repeat if possible
        if (newDeck.length > 1 && newDeck[newDeck.length - 1] === lastPickedJudgeId.current) {
          [newDeck[0], newDeck[newDeck.length - 1]] = [newDeck[newDeck.length - 1], newDeck[0]];
        }
        setJudgeDeck(newDeck);
        lastJudgePool.current = [...ratingIds];
      }
    } else {
      setJudgeDeck([]);
      lastJudgePool.current = [];
    }
  }, [filteredRatings, judgeDeck.length]);

  useEffect(() => {
  if (!roomCode || !user) return;

  const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    // Point to your new Vercel API route
    authEndpoint: '/api/pusher/auth',
    auth: {
      params: {
        user_id: user.id,
        user_name: user.name
      }
    }
  });

  const channel = pusher.subscribe(`presence-room-${roomCode}`);

  // This event triggers once the auth is successful
  channel.bind('pusher:subscription_succeeded', () => {
    console.log("Successfully connected to the game room!");
  });

  // Handle other game events here...

  return () => {
    pusher.unsubscribe(`presence-room-${roomCode}`);
    pusher.disconnect();
  };
}, [roomCode, user.id]);

  // Timer States
  const [timeLimit, setTimeLimit] = useState(2); // Default 2 minutes
  const [pointsToWin, setPointsToWin] = useState(3); // Default 3 points
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Video Rendering States
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState('');
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [selectedVeoModel, setSelectedVeoModel] = useState<'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview'>('veo-3.1-fast-generate-preview');

  const handleRenderVideo = async () => {
    if (!winner) return;
    
    // Check for API key selection
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (window.confirm("Veo video generation requires a paid Google Cloud project API key. Would you like to select one now?")) {
          await window.aistudio.openSelectKey();
          // Proceed after key selection (assuming success as per guidelines)
        } else {
          return;
        }
      }
    }

    setIsRenderingVideo(true);
    setVideoProgress("Preparing cinematic render...");
    
    try {
      let imageUrl = winner.imageUrl;
      if (imageUrl.startsWith('vault:')) {
        const resolved = await imageStore.getImage(imageUrl);
        if (resolved) imageUrl = resolved;
      }
      
      const videoUrl = await generateVeoVideo(imageUrl, selectedVeoModel, (status) => {
        setVideoProgress(status);
      });
      
      setRenderedVideoUrl(videoUrl);
    } catch (error: any) {
      console.error("Video rendering failed:", error);
      alert(`Cinematic rendering failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsRenderingVideo(false);
      setVideoProgress("");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room?.gameState === 'playing' && activeStrip && !hasSubmitted && timeLeft !== null && timeLeft > 0 && preGameState === 'none') {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
    } else if (timeLeft === 0 && !hasSubmitted && !isSavingLocal && preGameState === 'none') {
      // Set a flag or change timeLeft to prevent re-triggering if submission fails
      setTimeLeft(-1);
      if (role === 'writer') {
        handleSaveAndSubmit();
      } else if (role === 'judge' && room?.host === user?.id) {
        // If time runs out and judge is host, force transition to judging if needed
        // Actually, the judge just waits for submissions. 
        // If time is up, everyone should be forced to submit.
      }
    }
    return () => clearInterval(timer);
  }, [room?.gameState, activeStrip, hasSubmitted, timeLeft, isSavingLocal, role, room?.host, user?.id]);

  useEffect(() => {
    if (room?.gameState === 'playing' && activeStrip && !hasSubmitted && (timeLeft === null || timeLeft === -1)) {
      setTimeLeft((room.timeLimit || timeLimit) * 60);
    }
  }, [room?.gameState, activeStrip, hasSubmitted, room?.timeLimit, timeLimit, timeLeft]);

  useEffect(() => {
    if (previewImage) {
      if (previewImage.startsWith('vault:')) {
        imageStore.getImage(previewImage).then(url => setResolvedPreviewImage(url || ''));
      } else {
        setResolvedPreviewImage(previewImage);
      }
    } else {
      setResolvedPreviewImage(null);
    }
  }, [previewImage]);

  const pickWriterComic = () => {
    if (filteredBinderPages.length === 0) return;
    
    let currentDeck = [...writerDeck];
    if (currentDeck.length === 0) {
      currentDeck = shuffleArray([...filteredBinderPages]);
      if (currentDeck.length > 1 && currentDeck[currentDeck.length - 1] === lastPickedWriterId.current) {
        [currentDeck[0], currentDeck[currentDeck.length - 1]] = [currentDeck[currentDeck.length - 1], currentDeck[0]];
      }
    }
    
    const nextId = currentDeck.pop()!;
    lastPickedWriterId.current = nextId;
    setWriterDeck(currentDeck);
    
    const strip = history.find(h => h.id === nextId);
    if (strip) {
      const profile = comics.find(c => c.id === strip.comicProfileId);
      const primaryFont = profile?.selectedFonts?.[0] || 'Amatic SC';

      setActiveStrip(strip);
      // Initialize text fields as empty and use the series primary font
      setLocalTextFields((strip.textFields || []).map(tf => ({ ...tf, text: '', font: primaryFont })));
      setUsedHints(new Set());
      
      // Mock a RatedComic for selectedComic
      setSelectedComic({
        id: `temp_${strip.id}`,
        comicProfileId: strip.comicProfileId,
        stripId: strip.id,
        imageUrl: strip.exportImageUrl || strip.finishedImageUrl,
        rating: 0,
        timestamp: Date.now(),
        name: strip.name
      });

      // Start pre-game sequence
      setPreGameState('cover');
      setTimeLeft(timeLimit * 60);

      // Sync to room if host
      if (room?.host === user?.id && roomCode) {
        socket?.emit('update-game-state', {
          roomCode,
          newState: { 
            gameState: 'playing',
            activeStripId: strip.id,
            activeStrip: strip,
            timeLimit: timeLimit
          }
        });
      }

      setTimeout(() => {
        setPreGameState('go');
        setTimeout(() => {
          setPreGameState('none');
        }, 1000);
      }, 3000);
    }
  };

  const handlePickComic = () => {
    if (role === 'writer') {
      pickWriterComic();
    } else {
      if (filteredRatings.length === 0) return;
      
      let currentDeck = [...judgeDeck];
      if (currentDeck.length === 0) {
        currentDeck = shuffleArray(filteredRatings.map(r => r.id));
        if (currentDeck.length > 1 && currentDeck[currentDeck.length - 1] === lastPickedJudgeId.current) {
          [currentDeck[0], currentDeck[currentDeck.length - 1]] = [currentDeck[currentDeck.length - 1], currentDeck[0]];
        }
      }
      
      const nextId = currentDeck.pop()!;
      lastPickedJudgeId.current = nextId;
      setJudgeDeck(currentDeck);
      
      const randomComic = filteredRatings.find(r => r.id === nextId);
      if (!randomComic) return;
      
      setSelectedComic(randomComic);
      
      const strip = history.find(h => h.id === randomComic.stripId);
      if (strip) {
        const profile = comics.find(c => c.id === strip.comicProfileId);
        const primaryFont = profile?.selectedFonts?.[0] || 'Amatic SC';

        setActiveStrip(strip);
        // Initialize text fields as empty and use the series primary font
        setLocalTextFields((strip.textFields || []).map(tf => ({ ...tf, text: '', font: primaryFont })));
        setUsedHints(new Set());
      }
      
      // Simulate submitted comics for the judge from existing ratings
      // Filter these as well to ensure they match the genre if needed, though they are just distractors
      const others = filteredRatings
        .filter(r => r.id !== randomComic.id && r.stripId === randomComic.stripId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4); // Get up to 4 archived comics for the same strip
      setSubmittedComics(others);

      // Sync to room if judge
      if (role === 'judge' && roomCode) {
        socket?.emit('update-game-state', {
          roomCode,
          newState: { 
            gameState: 'playing',
            activeStripId: strip?.id,
            activeStrip: strip,
            selectedComic: randomComic,
            previewImage: null
          }
        });
      }
    }
  };

  // Auto-pick for writer when role changes
  useEffect(() => {
    if (role === 'writer' && !selectedComic && !activeStrip && filteredBinderPages.length > 0 && writerDeck.length > 0) {
      // Small timeout to ensure state is settled
      const timer = setTimeout(() => {
        pickWriterComic();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [role, selectedComic, activeStrip, filteredBinderPages.length, writerDeck.length]);

  const handlePreviewImage = (url: string | null) => {
    setPreviewImage(url);
    if (role === 'judge' && roomCode) {
      socket?.emit('update-game-state', {
        roomCode,
        newState: { previewImage: url }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check if all writers have submitted
    const writersCount = room.players.filter((p: any) => p.role === 'writer').length;
    if (submittedComics.length < writersCount) {
      alert(`Wait for all ${writersCount} writers to submit! (${submittedComics.length}/${writersCount} submitted)`);
      return;
    }

    const comicId = e.dataTransfer.getData('comicId');
    const comic = submittedComics.find(c => c.id === comicId);
    if (comic && roomCode && room) {
      setWinner(comic);
      
      const newScores = { ...room.scores };
      const newBranches = { ...room.branches };
      const winnerPlayerId = comic.playerId;
      if (winnerPlayerId) {
        newScores[winnerPlayerId] = (newScores[winnerPlayerId] || 0) + 1;
        newBranches[winnerPlayerId] = (newBranches[winnerPlayerId] || 0) + 5;
      }

      const isGameOver = winnerPlayerId && newScores[winnerPlayerId] >= (room.pointsToWin || pointsToWin);
      const newWinningComics = [...(room.winningComics || []), { ...comic, winnerId: winnerPlayerId }];

      socket?.emit('update-game-state', {
        roomCode,
        newState: { 
          winner: comic, 
          gameState: isGameOver ? 'game-over' : 'playing', // Stay in playing but with a winner
          scores: newScores,
          branches: newBranches,
          winningComics: newWinningComics,
          previewImage: null
        }
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, comic: RatedComic) => {
    e.dataTransfer.setData('comicId', comic.id);
  };

  const handleUpdateText = (id: string, text: string) => {
    setLocalTextFields(prev => prev.map(tf => tf.id === id ? { ...tf, text } : tf));
  };

  const handleSaveAndSubmit = async () => {
    if (!activeStrip || isSavingLocal || !selectedComic) return;
    setIsSavingLocal(true);
    
    // Stop the timer loop immediately to prevent multiple alerts
    setHasSubmitted(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      let imageUrl = activeStrip.exportImageUrl || activeStrip.finishedImageUrl;
      const originalImageUrl = imageUrl; // Keep for fallback

      if (imageUrl.startsWith('vault:')) {
        const resolved = await imageStore.getImage(imageUrl);
        if (resolved) imageUrl = resolved;
      }
      
      img.src = imageUrl;

      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("Failed to load image for flattening. This might be a CORS issue."));
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error("Image load timeout")), 10000);
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        localTextFields.forEach(tf => {
          const x = (tf.x / 100) * canvas.width;
          const y = (tf.y / 100) * canvas.height;
          const w = (tf.width / 100) * canvas.width;
          const h = (tf.height / 100) * canvas.height;

          let cleanText = tf.text;
          const nameMatch = cleanText.match(/^[^:]+:\s*/);
          if (nameMatch) {
            cleanText = cleanText.substring(nameMatch[0].length);
          }

          const fontName = tf.font || 'Inter';
          const fontFamily = getFontFamily(fontName).replace(/,.*$/, '').replace(/"/g, '');
          
          let fontSize = 40 * (canvas.height / 1000);
          ctx.font = `${fontSize}px "${fontFamily}"`;
          
          const wrapText = (text: string, maxWidth: number) => {
            const words = text.split(' ');
            const lines = [];
            if (words.length === 0) return [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
              const word = words[i];
              const width = ctx.measureText(currentLine + " " + word).width;
              if (width < maxWidth) {
                currentLine += " " + word;
              } else {
                lines.push(currentLine);
                currentLine = word;
              }
            }
            lines.push(currentLine);
            return lines;
          };

          while (fontSize > 8) {
            ctx.font = `${fontSize}px "${fontFamily}"`;
            const lines = wrapText(cleanText, w * 0.9);
            const totalHeight = lines.length * fontSize * 1.2;
            if (totalHeight < h * 0.9) break;
            fontSize -= 1;
          }

          ctx.fillStyle = '#000000';
          ctx.textAlign = tf.alignment as CanvasTextAlign || 'center';
          ctx.textBaseline = 'middle';

          const lines = wrapText(cleanText, w * 0.9);
          const lineHeight = fontSize * 1.2;
          const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;

          lines.forEach((line, i) => {
            const lineX = tf.alignment === 'left' ? x + w * 0.05 : tf.alignment === 'right' ? x + w * 0.95 : x + w / 2;
            ctx.fillText(line, lineX, startY + i * lineHeight);
          });
        });

        const finalDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const downscaled = await downscaleImage(finalDataUrl, 1200);
        const vaultedUrl = await imageStore.vaultify(downscaled);
        
        submitToJudge(vaultedUrl);
      } catch (flattenError) {
        console.warn("Flattening failed, submitting original image instead:", flattenError);
        // Fallback to original image if flattening fails (e.g. CORS)
        submitToJudge(originalImageUrl);
      }
    } catch (error) {
      console.error("Failed to process submission:", error);
      alert("Failed to process submission. Please try again.");
      setHasSubmitted(false); // Allow retry if it was a high-level failure
    } finally {
      setIsSavingLocal(false);
    }
  };

const submitToJudge = async (imageUrl: string) => {
  if (!activeStrip || !roomCode) return;

  const newSubmission: RatedComic = {
    id: `sub_${Date.now()}`,
    stripId: activeStrip.id,
    comicProfileId: activeStrip.comicProfileId,
    name: `Submission ${submittedComics.length + 1}`,
    imageUrl: imageUrl,
    rating: 0,
    timestamp: Date.now(),
    textFields: localTextFields,
    playerId: user.id // Using user.id since socket.id is less reliable in serverless
  };

  try {
    // 1. Update Pusher via our Vercel API Route
    const response = await fetch('/api/game/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        submission: newSubmission
      }),
    });

    if (!response.ok) throw new Error('Failed to notify judge');

    // 2. Local State Updates
    let finalSubmissions = [...submittedComics, newSubmission];
    
    // Fill with archived data if needed (as per your original logic)
    if (finalSubmissions.length < 4) {
      const archived = ratings
        .filter(r => !finalSubmissions.some(fs => fs.id === r.id) && r.stripId === activeStrip.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4 - finalSubmissions.length);
      finalSubmissions = [...finalSubmissions, ...archived];
    }
    
    setSubmittedComics(finalSubmissions);
    setHasSubmitted(true);
    setRole('judge');

    } catch (error) {
      console.error("Submission Error:", error);
      alert("Could not reach the game relay. Check your connection.");
      setHasSubmitted(false);
    }
  };

  const resetRoundState = () => {
    setSelectedComic(null);
    setSubmittedComics([]);
    setWinner(null);
    setHasSubmitted(false);
    setLocalTextFields([]);
    setActiveStrip(null);
    setUsedHints(new Set());
    setRenderedVideoUrl(null);
    setIsEnlarged(false);
    setTimeLeft(null);
    setPreGameState('none');
  };

  if (!roomCode) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100"></div>
        <button 
          onClick={() => {
            const newUrl = `${window.location.origin}${window.location.pathname}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            onExit();
          }} 
          className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-xs z-10"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Exit Play Mode
        </button>
        
        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
          <div className="w-24 h-24 bg-amber-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl mb-8 animate-bounce">
            <i className="fa-solid fa-gamepad"></i>
          </div>
          <h1 className="text-5xl font-header uppercase tracking-widest text-slate-800 mb-2">DiE-A-Log</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-12">Multiplayer Studio</p>
          
          <div className="w-full space-y-4">
            <button 
              onClick={handleCreateGame}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-plus"></i>
              Start New Game
            </button>
            
            <div className="relative py-4 flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
              <input 
                type="text" 
                placeholder="ENTER GAME CODE" 
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center font-black text-xl tracking-[0.3em] outline-none focus:ring-4 focus:ring-amber-600/5 transition-all"
              />
              <button 
                onClick={handleJoinGame}
                disabled={!joinCodeInput}
                className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-amber-700 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                Join Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (roomCode && !room) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Connecting to Game Server...</p>
          <p className="text-[10px] text-slate-300 mt-4 font-black uppercase tracking-widest">Room: {roomCode}</p>
          <button 
            onClick={() => {
              socket?.disconnect();
              setRoomCode(null);
              setRoom(null);
              const newUrl = `${window.location.origin}${window.location.pathname}`;
              window.history.pushState({ path: newUrl }, '', newUrl);
            }}
            className="mt-12 text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Cancel Connection
          </button>
        </div>
      </div>
    );
  }

  if (room && !room.players.find((p: any) => p.id === user?.id)) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Joining Room...</p>
        </div>
      </div>
    );
  }

  if (room?.gameState === 'lobby') {
    const isHost = room.host === user?.id;
    const shareLink = `${window.location.origin}${window.location.pathname}?game=${roomCode}`;

    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100"></div>
        
        <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Side: Game Info & QR */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-100 text-amber-700 rounded-full mb-6">
              <i className="fa-solid fa-tower-broadcast animate-pulse"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Lobby Active</span>
            </div>
            <h1 className="text-6xl font-header uppercase tracking-widest text-slate-800 mb-2">Game Lobby</h1>
            <p className="text-slate-500 mb-12 max-w-md">Share the code or QR below with your friends to start the comic battle.</p>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <QRCodeSVG value={shareLink} size={180} level="H" includeMargin={true} />
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Game Code</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-800 tracking-[0.2em]">{roomCode}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(roomCode!);
                        setCopyFeedback(true);
                        setTimeout(() => setCopyFeedback(false), 2000);
                      }}
                      className="text-slate-300 hover:text-amber-600 transition-colors"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                    copyFeedback ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <i className={`fa-solid ${copyFeedback ? 'fa-check' : 'fa-link'}`}></i>
                  {copyFeedback ? 'Link Copied!' : 'Copy Share Link'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Players & Start */}
          <div className="w-full lg:w-96 flex flex-col gap-8">
            <div className="bg-white/80 backdrop-blur p-8 rounded-[3rem] border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Players ({room.players.length})</h3>
                <div className="flex -space-x-2">
                  {room.players.map((p: any) => (
                    <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                      {p.picture ? <img src={p.picture} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-[10px] text-slate-300"></i>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {room.players.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-50 border border-slate-100">
                        {p.picture ? <img src={p.picture} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-xs text-slate-300"></i>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{p.name}</span>
                        {p.id === room.host && <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Host</span>}
                      </div>
                    </div>
                    {p.id === user?.id && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                {isHost && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Round Time (Minutes)</label>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setTimeLimit(Math.max(1, timeLimit - 1))} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2 text-center font-black text-slate-800">{timeLimit}m</div>
                        <button onClick={() => setTimeLimit(Math.min(10, timeLimit + 1))} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points to Win</label>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setPointsToWin(Math.max(1, pointsToWin - 1))} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2 text-center font-black text-slate-800">{pointsToWin}</div>
                        <button onClick={() => setPointsToWin(Math.min(10, pointsToWin + 1))} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isHost ? (
                  <button 
                    onClick={handleStartGame}
                    disabled={room.players.length < 1}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Start Game Protocol
                  </button>
                ) : (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin text-slate-300"></i>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waiting for host...</p>
                    </div>
                    <div className="flex justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      <span>{room.timeLimit || timeLimit}m Rounds</span>
                      <span>•</span>
                      <span>First to {room.pointsToWin || pointsToWin}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => {
                socket?.disconnect();
                setRoomCode(null);
                setRoom(null);
                const newUrl = `${window.location.origin}${window.location.pathname}`;
                window.history.pushState({ path: newUrl }, '', newUrl);
              }}
              className="text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-[10px] transition-all"
            >
              Leave Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (room?.gameState === 'game-over') {
    const sortedPlayers = [...room.players].sort((a, b) => (room.scores[b.id] || 0) - (room.scores[a.id] || 0));
    const overallWinner = sortedPlayers[0];
    const userScore = room.scores[user?.id || ''] || 0;
    const isUserWinner = overallWinner.id === user?.id;

    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-50"></div>
        
        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
          <div className="mb-12 text-center animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="w-24 h-24 bg-amber-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl mb-6 mx-auto">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <h1 className="text-6xl font-header uppercase tracking-widest text-white mb-2">Game Over</h1>
            <p className="text-amber-500 font-black uppercase tracking-[0.2em] text-xs">Final Standings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mb-16">
            {/* Winner Spotlight */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 flex flex-col items-center animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
              <div className="flex items-center gap-6 mb-10 w-full">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 overflow-hidden shadow-2xl">
                  {overallWinner.picture ? <img src={overallWinner.picture} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-2xl text-white/20"></i>}
                </div>
                <div className="flex flex-col">
                  <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Grand Champion</span>
                  <h2 className="text-4xl font-header uppercase tracking-widest text-white">{overallWinner.name}</h2>
                </div>
                <div className="ml-auto bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-xl">
                  {room.scores[overallWinner.id]} pts
                </div>
              </div>

              <div className="w-full">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Winning Comics</h3>
                <div className="flex flex-wrap gap-6 justify-center">
                  {(room.winningComics || []).filter((c: any) => c.winnerId === overallWinner.id).map((comic: any, idx: number) => (
                    <div key={idx} className="w-48 aspect-square rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl hover:scale-105 transition-transform cursor-pointer" onClick={() => handlePreviewImage(comic.imageUrl)}>
                      <CachedImage src={comic.imageUrl} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 animate-in fade-in slide-in-from-right-8 duration-700 delay-400">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8">Leaderboard</h3>
              <div className="space-y-4">
                {sortedPlayers.map((p, idx) => (
                  <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border ${p.id === user?.id ? 'bg-amber-600/20 border-amber-500/30' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-white/20 w-4">#{idx + 1}</span>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                        {p.picture ? <img src={p.picture} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-xs text-white/20"></i>}
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-tight">{p.name}</span>
                    </div>
                    <span className="text-lg font-black text-white">{room.scores[p.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600">
            <button 
              onClick={() => {
                if (room.host === user?.id) {
                  handleStartGame();
                }
              }}
              disabled={room.host !== user?.id}
              className="px-12 py-5 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-amber-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {room.host === user?.id ? 'Play Again' : 'Waiting for Host...'}
            </button>
            <button 
              onClick={() => {
                socket?.disconnect();
                onExit();
              }}
              className="px-12 py-5 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
            >
              Return to Studio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'writer' && room?.gameState === 'playing' && (room?.branches?.[user?.id || ''] ?? 30) <= 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-black opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="w-48 h-48 bg-amber-900 rounded-[3rem] flex flex-col items-center justify-center text-amber-500 shadow-2xl mb-12 border-4 border-amber-800/50">
            <i className="fa-solid fa-tree text-6xl mb-2"></i>
            <span className="font-header text-3xl tracking-tighter">LOG</span>
          </div>
          <h1 className="text-7xl font-header uppercase tracking-[0.2em] text-white mb-4">DiE A LOG</h1>
          <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12">You ran out of branches.</p>
          
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center max-w-sm">
            <p className="text-xs text-slate-400 uppercase tracking-widest leading-relaxed">
              Your creative life force has withered. You can no longer edit or use hints this round.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 text-amber-500/50">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Waiting for round to end...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (room?.gameState === 'playing' && role === 'select') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
          <div className="w-24 h-24 bg-amber-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl mb-8">
            <i className="fa-solid fa-user-tag"></i>
          </div>
          <h2 className="text-4xl font-header uppercase tracking-widest mb-4">Select Your Role</h2>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-12">The game is already in progress. Pick a role to join.</p>
          
          <div className="grid grid-cols-1 gap-4 w-full">
            <button 
              onClick={() => {
                setRole('writer');
                if (roomCode) {
                  const updatedPlayers = room.players.map((p: any) => p.id === user?.id ? { ...p, role: 'writer' } : p);
                  socket?.emit('update-game-state', { roomCode, newState: { players: updatedPlayers } });
                }
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 p-8 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105"
            >
              <i className="fa-solid fa-pen-nib text-4xl text-amber-500"></i>
              <span className="text-xl font-black uppercase tracking-widest">Writer</span>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Create comics from the script</p>
            </button>
            
            <button 
              onClick={() => {
                setRole('judge');
                if (roomCode) {
                  const updatedPlayers = room.players.map((p: any) => p.id === user?.id ? { ...p, role: 'judge' } : p);
                  socket?.emit('update-game-state', { roomCode, newState: { players: updatedPlayers } });
                }
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 p-8 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105"
            >
              <i className="fa-solid fa-gavel text-4xl text-amber-500"></i>
              <span className="text-xl font-black uppercase tracking-widest">Judge</span>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Select the best comic each round</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeComicProfile = comics.find(c => c.id === activeStrip?.comicProfileId);
  const bgColor = activeComicProfile?.backgroundColor || '#f8fafc'; // Default to slate-50 hex

  return (
    <div 
      className="h-full flex flex-col overflow-hidden relative"
      style={{ backgroundColor: bgColor }}
    >
        <div className="absolute top-6 left-6 z-50 flex gap-4">
          <button 
            onClick={() => {
              resetRoundState();
              setRole('select');
            }} 
            className="text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-xs bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Change Role
          </button>
          {onEdit && (
            <button 
              onClick={onEdit}
              className="text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-xs bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm"
            >
              <i className="fa-solid fa-pen-to-square mr-2"></i> Edit
            </button>
          )}
        </div>

        {room?.scores && (
          <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
            <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="flex -space-x-2">
                {room.players.map((p: any) => (
                  <div key={p.id} className={`w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100 ${room.scores[p.id] > 0 ? 'ring-2 ring-amber-500 ring-offset-1' : ''}`}>
                    {p.picture ? <img src={p.picture} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-[10px] text-slate-300"></i>}
                  </div>
                ))}
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex gap-4">
                {room.players.map((p: any) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.name.split(' ')[0]}</span>
                      <div className="flex items-center gap-0.5 text-[8px] font-black text-emerald-600">
                        <i className="fa-solid fa-leaf scale-75"></i>
                        {room.branches?.[p.id] ?? 30}
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-800">{room.scores[p.id] || 0}</span>
                  </div>
                ))}
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Goal</span>
                <span className="text-xs font-black text-amber-700">{room.pointsToWin}</span>
              </div>
            </div>
          </div>
        )}

      {role !== 'select' && !selectedComic && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {role === 'writer' && !activeStrip ? (
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center max-w-2xl w-full text-center">
               <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 text-4xl mb-8 animate-pulse">
                 <i className="fa-solid fa-hourglass-half"></i>
               </div>
               <h2 className="text-4xl font-header uppercase tracking-widest text-slate-800 mb-4">Waiting for Judge</h2>
               <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">The judge is selecting the next comic strip...</p>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center max-w-2xl w-full text-center">
              <h2 className="text-5xl font-header uppercase tracking-widest text-slate-800 mb-6">
                Ready to {role === 'judge' ? 'Judge' : 'Write'}
              </h2>
            
            {role === 'judge' && (
              <div className="mb-8 w-full max-w-3xl">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Select Genres for Game</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        setSelectedGenreIds(prev => 
                          prev.includes(genre.id) 
                            ? prev.filter(id => id !== genre.id)
                            : [...prev, genre.id]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                        selectedGenreIds.includes(genre.id)
                          ? 'text-slate-900 shadow-md ring-2 ring-offset-1 ring-slate-900'
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 opacity-60'
                      }`}
                      style={selectedGenreIds.includes(genre.id) ? { backgroundColor: genre.color, borderColor: genre.color } : {}}
                    >
                      <span>{genre.icon}</span>
                      <span>{genre.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-amber-700 text-2xl">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div className="text-left">
                <span className="block text-3xl font-black text-slate-800">
                  {role === 'writer' ? filteredBinderPages.length : filteredRatings.length}
                </span>
                <span className="block text-xs font-black uppercase tracking-widest text-slate-400">Comics Available</span>
              </div>
            </div>

            {(role === 'writer' ? filteredBinderPages.length > 0 : filteredRatings.length > 0) ? (
              <button 
                onClick={handlePickComic}
                className="px-12 py-5 bg-amber-700 text-white rounded-2xl font-black uppercase tracking-widest text-xl shadow-xl hover:bg-amber-800 transition-all hover:scale-105"
              >
                Select Comic
              </button>
            ) : (
              <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100">
                <i className="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
                <p className="font-bold">No comics available!</p>
                <p className="text-sm mt-2 opacity-80">
                  {role === 'judge' && selectedGenreIds.length < GENRES.length 
                    ? "Try selecting more genres." 
                    : "Go back to Edit mode and use the Testing Lab to submit comics to Play Mode."}
                </p>
              </div>
            )}
          </div>
        )}
        </div>
      )}

      {room?.gameState === 'playing' && timeLeft !== null && !hasSubmitted && (
        <div className={`fixed z-[60] px-6 py-3 rounded-2xl shadow-xl border-2 flex items-center gap-3 transition-all duration-500 ${
          preGameState === 'cover' 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 bg-white border-slate-200 text-slate-800' 
            : 'top-6 left-1/2 -translate-x-1/2 bg-white border-slate-100 text-slate-800'
        } ${timeLeft < 30 && preGameState === 'none' ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : ''}`}>
          <i className={`fa-solid fa-clock ${timeLeft < 30 && preGameState === 'none' ? 'text-white' : 'text-amber-600'}`}></i>
          <span className="font-black text-xl tabular-nums">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {selectedComic && (role === 'judge' || hasSubmitted) && (
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto mb-12">
            <h2 className="text-center text-2xl font-header uppercase tracking-widest text-slate-800 mb-6">
              {winner ? 'Winning Comic' : 'Winner Selection'}
            </h2>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-64 h-64 mx-auto rounded-[2rem] border-4 border-dashed flex items-center justify-center transition-all ${winner ? 'border-amber-500 bg-amber-50 cursor-zoom-in' : 'border-slate-300 bg-slate-100'} ${role !== 'judge' ? 'pointer-events-none' : ''}`}
              onClick={() => winner && handlePreviewImage(winner.imageUrl)}
            >
              {winner ? (
                <div className="relative w-full h-full p-2">
                  <CachedImage src={winner.imageUrl} className="w-full h-full object-cover rounded-2xl shadow-lg" />
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-2xl shadow-xl">
                    <i className="fa-solid fa-star"></i>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-30">
                  <i className="fa-solid fa-star text-6xl mb-4"></i>
                  <p className="text-xs font-black uppercase tracking-widest">
                    {role === 'judge' ? 'Drag Winner Here' : 'Waiting for Judge'}
                  </p>
                  {role === 'judge' && (
                    <p className="text-[8px] mt-2 font-black uppercase tracking-widest text-slate-400">
                      {submittedComics.length}/{room.players.filter((p: any) => p.role === 'writer').length} Submissions
                    </p>
                  )}
                </div>
              )}
            </div>

            {winner && (
              <div className="mt-8 flex flex-col items-center gap-6">
                {winner.playerId === user?.id ? (
                  <div className="flex flex-col items-center gap-6 w-full">
                    <div className="bg-emerald-50 text-emerald-700 px-8 py-4 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-bounce">
                      <i className="fa-solid fa-trophy text-2xl"></i>
                      <span className="font-black uppercase tracking-widest text-sm">You Won the Round!</span>
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          if (roomCode) {
                            const updatedPlayers = room.players.map((p: any) => ({
                              ...p,
                              role: p.id === user?.id ? 'judge' : 'writer'
                            }));
                            
                            socket?.emit('update-game-state', {
                              roomCode,
                              newState: { 
                                gameState: 'playing',
                                submissions: [], 
                                winner: null,
                                activeStripId: null,
                                activeStrip: null,
                                players: updatedPlayers,
                                previewImage: null
                              }
                            });
                          }
                          resetRoundState();
                        }}
                        className="px-12 py-4 bg-amber-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-amber-800 transition-all hover:scale-105 active:scale-95 z-50"
                      >
                        <i className="fa-solid fa-forward mr-2"></i> Next Round You are the Judge
                      </button>

                      <button 
                        onClick={handleShare}
                        className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                      >
                        <i className="fa-solid fa-share-nodes"></i>
                        Share Comic
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-3 text-slate-400 font-black uppercase tracking-widest text-xs">
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      Waiting for winner to start next round...
                    </div>
                    {winner.name && (
                      <span className="text-slate-800 font-black uppercase tracking-widest text-sm">
                        Winner: {winner.name}
                      </span>
                    )}
                  </div>
                )}

                {isSharing && winner && winner.playerId === user?.id && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSharing(false)}></div>
                    <div className="relative bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 w-full max-w-sm flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
                      <div className="text-center">
                        <h3 className="text-2xl font-header uppercase tracking-widest text-slate-800 mb-2">Share Your Masterpiece</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a platform</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <button 
                          onClick={() => shareToSocial('x')}
                          className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all group"
                        >
                          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                            <i className="fa-brands fa-x-twitter"></i>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">X / Twitter</span>
                        </button>
                        
                        <button 
                          onClick={() => shareToSocial('facebook')}
                          className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all group"
                        >
                          <div className="w-12 h-12 bg-[#1877F2] text-white rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                            <i className="fa-brands fa-facebook-f"></i>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Facebook</span>
                        </button>

                        <button 
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = winner.imageUrl;
                            a.download = `comic_${winner.name.replace(/\s+/g, '_')}.png`;
                            a.click();
                            setIsSharing(false);
                          }}
                          className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all group col-span-2"
                        >
                          <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-download"></i>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Download & Share to Instagram</span>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setIsSharing(false)}
                        className="text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-[10px] transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Cinematic Render Section - Only for Winner */}
                {winner.playerId === user?.id && (
                  <div className="flex flex-col items-center gap-4 bg-white/50 backdrop-blur p-6 rounded-3xl border border-amber-200 shadow-sm w-full max-w-2xl">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cinematic Render</span>
                      <div className="flex bg-slate-200 rounded-full p-1">
                        <button 
                          onClick={() => setSelectedVeoModel('veo-3.1-fast-generate-preview')}
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectedVeoModel === 'veo-3.1-fast-generate-preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Veo 3
                        </button>
                        <button 
                          onClick={() => setSelectedVeoModel('veo-3.1-generate-preview')}
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectedVeoModel === 'veo-3.1-generate-preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Veo 3 Pro
                        </button>
                      </div>
                    </div>
                    
                    {renderedVideoUrl ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <video 
                          src={renderedVideoUrl} 
                          controls 
                          autoPlay 
                          loop 
                          className="w-full aspect-video rounded-2xl shadow-2xl border-4 border-white bg-black"
                        />
                        <div className="flex gap-4">
                          <button 
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = renderedVideoUrl;
                              a.download = `cinematic_${winner.name.replace(/\s+/g, '_')}.mp4`;
                              a.click();
                            }}
                            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all"
                          >
                            <i className="fa-solid fa-download mr-2"></i> Download Video
                          </button>
                          <button 
                            onClick={() => setRenderedVideoUrl(null)}
                            className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-300 transition-all"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleRenderVideo}
                        disabled={isRenderingVideo}
                        className={`px-10 py-4 bg-white text-amber-700 border-2 border-amber-700 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-amber-50 transition-all hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100 ${isRenderingVideo ? 'animate-pulse' : ''}`}
                      >
                        {isRenderingVideo ? (
                          <>
                            <i className="fa-solid fa-circle-notch animate-spin"></i>
                            Rendering...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-clapperboard"></i>
                            Render Cinematic Video
                          </>
                        )}
                      </button>
                    )}
                    
                    {isRenderingVideo && (
                      <div className="mt-4 text-center w-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">{videoProgress}</p>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-600 animate-progress-indeterminate"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-center text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Submitted Comics</h3>
            <div className="flex flex-wrap justify-center gap-8 pb-20">
              {submittedComics.map((comic, idx) => (
                <div 
                  key={comic.id}
                  draggable={role === 'judge' && !winner}
                  onDragStart={(e) => handleDragStart(e, comic)}
                  className={`relative group ${role === 'judge' && !winner ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                >
                  <div className="w-48 aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white transition-transform group-hover:scale-105">
                    <CachedImage src={comic.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handlePreviewImage(comic.imageUrl)}
                        className="w-12 h-12 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                      >
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </button>
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                    #{idx + 1}
                  </div>
                </div>
              ))}
              {submittedComics.length === 0 && (
                <div className="text-slate-400 font-black uppercase tracking-widest text-sm">Waiting for submissions...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {role === 'writer' && selectedComic && !hasSubmitted && (
        <div className="flex-1 flex flex-col p-8 items-center justify-center overflow-y-auto relative">
          {preGameState === 'cover' && activeStrip && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <h2 className="text-4xl font-header uppercase tracking-widest text-slate-800 mb-8">Get Ready!</h2>
              <div className="w-full max-w-2xl aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white">
                {(() => {
                  const book = books.find(b => b.id === activeStrip.comicProfileId);
                  const coverUrl = book?.coverImageUrl || activeStrip.finishedImageUrl;
                  return <CachedImage src={coverUrl} className="w-full h-full object-cover" />;
                })()}
              </div>
            </div>
          )}

          {preGameState === 'go' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
              <div className="bg-amber-600 text-white font-header text-9xl uppercase tracking-tighter px-20 py-10 rounded-[4rem] shadow-2xl animate-in zoom-in duration-300">
                Go!
              </div>
            </div>
          )}

          {preGameState === 'none' && !hasSubmitted ? (
            <div className="max-w-6xl w-full bg-white rounded-[3rem] shadow-2xl p-12 flex flex-col items-center animate-in fade-in duration-500">
              <h2 className="text-3xl font-header uppercase tracking-widest text-slate-800 mb-4">Your Assignment</h2>
              <p className="text-slate-500 mb-10">Edit this comic and submit it to the judge. Click the comic to enlarge.</p>
              
              {activeStrip ? (
                <div className="w-full flex flex-col gap-8">
                  <div className={`w-full transition-all duration-500 ${isEnlarged ? 'fixed inset-4 z-[100] bg-slate-900 rounded-[3rem] p-8 shadow-2xl flex flex-col' : 'flex flex-col lg:flex-row-reverse gap-12 relative'}`}>
                    {isEnlarged && (
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-header uppercase tracking-widest text-white">DiE-A-Log Editor</h3>
                        <button 
                          onClick={() => setIsEnlarged(false)}
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                        >
                          <i className="fa-solid fa-compress"></i>
                        </button>
                      </div>
                    )}
                    
                    <div className={isEnlarged ? 'flex-1 flex flex-col items-center justify-center min-h-0' : 'flex-1 flex flex-col'}>
                      <div 
                        className={`relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl border-8 ${isEnlarged ? 'border-slate-800 max-h-full max-w-full' : 'border-slate-50 cursor-zoom-in hover:border-amber-500/30 transition-colors'}`}
                        onClick={() => !isEnlarged && setIsEnlarged(true)}
                      >
                        <CachedImage src={activeStrip.exportImageUrl || activeStrip.finishedImageUrl} className="w-full h-full object-contain bg-black" />
                        {localTextFields.map(tf => {
                          const character = comics.flatMap(c => c.characters || []).find(c => c.name === tf.characterName);
                          const isHintUsed = usedHints.has(tf.id);
                          
                          return (
                            <div
                              key={tf.id}
                              className={`absolute flex items-center justify-center overflow-visible ${isEnlarged ? 'pointer-events-auto' : 'pointer-events-none'}`}
                              style={{
                                left: `${tf.x}%`,
                                top: `${tf.y}%`,
                                width: `${tf.width}%`,
                                height: `${tf.height}%`,
                              }}
                            >
                              {isEnlarged ? (
                                <div className="relative w-full h-full group">
                                  <EditableBubble 
                                    text={tf.text.replace(/^[^:]+:\s*/, '')} 
                                    alignment={tf.alignment || 'center'} 
                                    font={tf.font || 'Inter'} 
                                    onChange={(newText) => {
                                      const match = tf.text.match(/^[^:]+:\s*/);
                                      const prefix = match ? match[0] : '';
                                      handleUpdateText(tf.id, prefix + newText);
                                    }}
                                  />
                                  {/* Hint Button & Character Info */}
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap z-50 pointer-events-auto">
                                    {character?.avatarUrl || character?.imageUrl ? (
                                      <CachedImage src={character.avatarUrl || character.imageUrl} className="w-5 h-5 rounded-full object-cover border border-slate-600" alt={tf.characterName} />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-black text-slate-300">?</div>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{tf.characterName}</span>
                                    <div className="w-px h-3 bg-slate-600 mx-1"></div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (room?.branches?.[user?.id || ''] <= 0) return;
                                        if (tf.dialogueId && activeStrip.script) {
                                          const dialogue = activeStrip.script.flatMap(p => p.dialogue).find(d => d.id === tf.dialogueId);
                                          if (dialogue) {
                                            const match = tf.text.match(/^[^:]+:\s*/);
                                            const prefix = match ? match[0] : '';
                                            handleUpdateText(tf.id, prefix + dialogue.text);
                                            setUsedHints(prev => new Set(prev).add(tf.id));
                                            socket?.emit('use-hint', { roomCode });
                                          }
                                        }
                                      }}
                                      disabled={room?.branches?.[user?.id || ''] <= 0}
                                      className={`text-[9px] font-bold px-2 py-1 rounded-full transition-all flex items-center gap-1 ${
                                        isHintUsed ? 'bg-slate-600 text-slate-400' : 
                                        room?.branches?.[user?.id || ''] <= 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                                        'bg-amber-600 text-white hover:bg-amber-500'
                                      }`}
                                    >
                                      <i className="fa-solid fa-lightbulb"></i> Hint
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <AutoResizingText 
                                  text={tf.text.replace(/^[^:]+:\s*/, '')} 
                                  alignment={tf.alignment || 'center'} 
                                  font={tf.font || 'Inter'} 
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {!isEnlarged && (
                        <div className="w-full flex justify-center mt-6 pt-6 border-t border-slate-100">
                          <button 
                            onClick={handleSaveAndSubmit}
                            disabled={isSavingLocal}
                            className="px-16 py-5 bg-amber-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-amber-800 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-sm"
                          >
                            {isSavingLocal ? 'Submitting...' : 'Submit to Judge'}
                          </button>
                        </div>
                      )}
                    </div>

                    {!isEnlarged && (
                      <div className="w-full lg:w-96 flex flex-col gap-4 max-h-[60vh]">
                        <h3 className="font-header uppercase tracking-widest text-xl text-slate-800 mb-2 shrink-0">DiE-A-Log</h3>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                          {localTextFields
                            .sort((a, b) => {
                              if (!activeStrip?.script) return 0;
                              const getPanel = (tf: TextField) => activeStrip.script.find(p => p.dialogue.some(d => d.id === tf.dialogueId))?.panelNumber || 999;
                              return getPanel(a) - getPanel(b);
                            })
                            .map((tf, idx, arr) => {
                              const character = comics.flatMap(c => c.characters || []).find(c => c.name === tf.characterName);
                              const isHintUsed = usedHints.has(tf.id);
                              
                              const getPanel = (tf: TextField) => activeStrip?.script?.find(p => p.dialogue.some(d => d.id === tf.dialogueId))?.panelNumber;
                              const currentPanel = getPanel(tf);
                              const prevPanel = idx > 0 ? getPanel(arr[idx-1]) : undefined;
                              const showDivider = currentPanel !== undefined && currentPanel !== prevPanel;

                              return (
                                <React.Fragment key={tf.id}>
                                  {showDivider && (
                                    <div className="w-full py-2 flex items-center gap-4 opacity-50">
                                      <div className="h-px bg-slate-300 flex-1"></div>
                                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Panel {currentPanel}</span>
                                      <div className="h-px bg-slate-300 flex-1"></div>
                                    </div>
                                  )}
                                  <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        {character?.avatarUrl || character?.imageUrl ? (
                                          <CachedImage src={character.avatarUrl || character.imageUrl} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt={tf.characterName} />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 border border-slate-200">?</div>
                                        )}
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight truncate max-w-[80px]">{tf.characterName}</span>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          if (room?.branches?.[user?.id || ''] <= 0) return;
                                          if (tf.dialogueId && activeStrip.script) {
                                            const dialogue = activeStrip.script.flatMap(p => p.dialogue).find(d => d.id === tf.dialogueId);
                                            if (dialogue) {
                                              const match = tf.text.match(/^[^:]+:\s*/);
                                              const prefix = match ? match[0] : '';
                                              handleUpdateText(tf.id, prefix + dialogue.text);
                                              setUsedHints(prev => new Set(prev).add(tf.id));
                                              socket?.emit('use-hint', { roomCode });
                                            } else {
                                              alert("Dialogue ID not found in script.");
                                            }
                                          } else if (!tf.dialogueId) {
                                            alert("No Dialogue ID associated with this field.");
                                          }
                                        }}
                                        disabled={room?.branches?.[user?.id || ''] <= 0}
                                        className={`text-[8px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shrink-0 ${
                                          isHintUsed 
                                            ? 'bg-slate-200 text-slate-500' 
                                            : room?.branches?.[user?.id || ''] <= 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' :
                                            'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                                        }`}
                                        title={room?.branches?.[user?.id || ''] <= 0 ? "Out of branches" : "Fill with original script text"}
                                      >
                                        <i className="fa-solid fa-lightbulb text-[7px]"></i>
                                        Hint
                                      </button>
                                    </div>
                                    <textarea
                                      value={tf.text.replace(/^[^:]+:\s*/, '')}
                                      onChange={(e) => {
                                        const match = tf.text.match(/^[^:]+:\s*/);
                                        const prefix = match ? match[0] : '';
                                        handleUpdateText(tf.id, prefix + e.target.value);
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-slate-200 outline-none transition-all resize-none shadow-inner"
                                      rows={3}
                                      placeholder="Enter dialogue..."
                                    />
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          {localTextFields.length === 0 && (
                            <p className="text-center text-slate-300 text-[10px] italic py-10">No text fields defined for this page.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-2xl aspect-video bg-slate-100 rounded-3xl flex items-center justify-center mb-10">
                  <span className="text-slate-400 font-black uppercase tracking-widest">Loading Assignment...</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[2000] modal-backdrop flex items-center justify-center p-12 cursor-zoom-out" onClick={() => handlePreviewImage(null)}>
          <div className="relative max-w-8xl max-h-full">
            <img src={resolvedPreviewImage || null} className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.4)] border-[12px] border-white animate-in zoom-in-95" onClick={(e) => e.stopPropagation()} />
            <button className="absolute -top-6 -right-6 bg-slate-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-all shadow-2xl" onClick={() => handlePreviewImage(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

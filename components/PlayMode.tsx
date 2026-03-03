import React, { useState, useEffect, useRef } from 'react';
import { RatedComic, SavedComicStrip, ComicProfile, TextField } from '../types';
import { CachedImage } from './CachedImage';
import { imageStore } from '../services/imageStore';
import { downscaleImage } from '../utils/imageUtils';
import { generateVeoVideo } from '../services/gemini';
import { COMIC_FONTS, GENRES } from '../constants';

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
  ratings: RatedComic[];
  history: SavedComicStrip[];
  comics: ComicProfile[];
  binderPages: string[];
  onExit: () => void;
  onAddSubmission: (submission: RatedComic) => void;
  onEdit?: () => void;
}

export const PlayMode: React.FC<PlayModeProps> = ({ ratings, history, comics, binderPages, onExit, onAddSubmission, onEdit }) => {
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

  // Timer States
  const [timeLimit, setTimeLimit] = useState(2); // Default 2 minutes
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
    if (role === 'writer' && activeStrip && !hasSubmitted && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
    } else if (timeLeft === 0 && !hasSubmitted && !isSavingLocal) {
      handleSaveAndSubmit();
    }
    return () => clearInterval(timer);
  }, [role, activeStrip, hasSubmitted, timeLeft, isSavingLocal]);

  useEffect(() => {
    if (role === 'writer' && activeStrip && !hasSubmitted && timeLeft === null) {
      setTimeLeft(timeLimit * 60);
    }
  }, [role, activeStrip, hasSubmitted, timeLimit, timeLeft]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const comicId = e.dataTransfer.getData('comicId');
    const comic = submittedComics.find(c => c.id === comicId);
    if (comic) {
      setWinner(comic);
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
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsSavingLocal(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      let imageUrl = activeStrip.exportImageUrl || activeStrip.finishedImageUrl;
      if (imageUrl.startsWith('vault:')) {
        const resolved = await imageStore.getImage(imageUrl);
        if (resolved) imageUrl = resolved;
      }
      
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
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
          ctx.font = `${fontSize}px "${fontName}"`;
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
      
      const newSubmission: RatedComic = {
        id: `sub_${Date.now()}`,
        stripId: activeStrip.id,
        comicProfileId: activeStrip.comicProfileId,
        name: `Submission ${submittedComics.length + 1}`,
        imageUrl: vaultedUrl,
        rating: 0,
        timestamp: Date.now(),
        textFields: localTextFields
      };
      
      onAddSubmission(newSubmission);
      
      let finalSubmissions = [...submittedComics, newSubmission];
      
      // If fewer than 4 players, populate with archived comic data for the same strip
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
      console.error("Failed to generate final image:", error);
      alert("Failed to generate image.");
    } finally {
      setIsSavingLocal(false);
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
  };

  if (role === 'select') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100"></div>
        <button onClick={onExit} className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-xs z-10">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>
        <div className="relative z-10 flex flex-col items-center mt-[-5%]">
          <h1 className="text-5xl font-header uppercase tracking-widest text-slate-800 mb-12">Select Your Role</h1>
          <div className="flex gap-8">
            <button 
              onClick={() => setRole('judge')}
              className="w-64 h-64 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 flex flex-col items-center justify-end gap-4 hover:scale-105 hover:shadow-2xl hover:border-amber-500/50 transition-all group relative overflow-hidden"
            >
              {judgeImage && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
                  <img src={judgeImage} alt="Judge" className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="relative z-10 pb-6 flex flex-col items-center">
                <i className="fa-solid fa-gavel text-3xl text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></i>
                <span className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Judge</span>
              </div>
            </button>
            <button 
              onClick={() => setRole('writer')}
              className="w-64 h-64 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 flex flex-col items-center justify-end gap-4 hover:scale-105 hover:shadow-2xl hover:border-amber-500/50 transition-all group relative overflow-hidden"
            >
              {writerImage && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
                  <img src={writerImage} alt="Writer" className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="relative z-10 pb-6 flex flex-col items-center">
                <i className="fa-solid fa-pen-nib text-3xl text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></i>
                <span className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Writer</span>
              </div>
            </button>
          </div>

          <div className="mt-12 bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Round Time Limit (Minutes)</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setTimeLimit(Math.max(1, timeLimit - 1))}
                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <input 
                type="number" 
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center bg-transparent text-2xl font-black text-slate-800 outline-none"
              />
              <button 
                onClick={() => setTimeLimit(timeLimit + 1)}
                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
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

      {role !== 'select' && !selectedComic && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
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
                Pick a Comic
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
        </div>
      )}

      {role === 'judge' && selectedComic && (
        <div className="flex-1 flex flex-col p-8">
          <div className="w-full max-w-4xl mx-auto mb-12">
            <h2 className="text-center text-2xl font-header uppercase tracking-widest text-slate-800 mb-6">Winning Comic</h2>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-64 h-64 mx-auto rounded-[2rem] border-4 border-dashed flex items-center justify-center transition-all ${winner ? 'border-amber-500 bg-amber-50 cursor-zoom-in' : 'border-slate-300 bg-slate-100'}`}
              onClick={() => winner && setPreviewImage(winner.imageUrl)}
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
                  <p className="text-xs font-black uppercase tracking-widest">Drag Winner Here</p>
                </div>
              )}
            </div>
            {winner && (
              <div className="mt-8 flex flex-col items-center gap-6">
                <button 
                  onClick={() => {
                    resetRoundState();
                    setRole('writer');
                  }}
                  className="px-12 py-4 bg-amber-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-amber-800 transition-all hover:scale-105 active:scale-95 z-50"
                >
                  <i className="fa-solid fa-forward mr-2"></i> Start Next Round
                </button>

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
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-center text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Submitted Comics</h3>
            <div className="flex flex-wrap justify-center gap-8 pb-20">
              {submittedComics.map((comic, idx) => (
                <div 
                  key={comic.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comic)}
                  className="relative group cursor-grab active:cursor-grabbing"
                >
                  <div className="w-48 aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white transition-transform group-hover:scale-105">
                    <CachedImage src={comic.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setPreviewImage(comic.imageUrl)}
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

      {role === 'writer' && selectedComic && (
        <div className="flex-1 flex flex-col p-8 items-center justify-center overflow-y-auto">
          {timeLeft !== null && !hasSubmitted && (
            <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-xl border-2 flex items-center gap-3 transition-all ${timeLeft < 30 ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-white border-slate-100 text-slate-800'}`}>
              <i className={`fa-solid fa-clock ${timeLeft < 30 ? 'text-white' : 'text-amber-600'}`}></i>
              <span className="font-black text-xl tabular-nums">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
          {!hasSubmitted ? (
            <div className="max-w-6xl w-full bg-white rounded-[3rem] shadow-2xl p-12 flex flex-col items-center">
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
                                        if (tf.dialogueId && activeStrip.script) {
                                          const dialogue = activeStrip.script.flatMap(p => p.dialogue).find(d => d.id === tf.dialogueId);
                                          if (dialogue) {
                                            const match = tf.text.match(/^[^:]+:\s*/);
                                            const prefix = match ? match[0] : '';
                                            handleUpdateText(tf.id, prefix + dialogue.text);
                                            setUsedHints(prev => new Set(prev).add(tf.id));
                                          }
                                        }
                                      }}
                                      className={`text-[9px] font-bold px-2 py-1 rounded-full transition-all flex items-center gap-1 ${
                                        isHintUsed ? 'bg-slate-600 text-slate-400' : 'bg-amber-600 text-white hover:bg-amber-500'
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
                                          if (tf.dialogueId && activeStrip.script) {
                                            const dialogue = activeStrip.script.flatMap(p => p.dialogue).find(d => d.id === tf.dialogueId);
                                            if (dialogue) {
                                              const match = tf.text.match(/^[^:]+:\s*/);
                                              const prefix = match ? match[0] : '';
                                              handleUpdateText(tf.id, prefix + dialogue.text);
                                              setUsedHints(prev => new Set(prev).add(tf.id));
                                            } else {
                                              alert("Dialogue ID not found in script.");
                                            }
                                          } else if (!tf.dialogueId) {
                                            alert("No Dialogue ID associated with this field.");
                                          }
                                        }}
                                        className={`text-[8px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shrink-0 ${
                                          isHintUsed 
                                            ? 'bg-slate-200 text-slate-500' 
                                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                                        }`}
                                        title="Fill with original script text"
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
        <div className="fixed inset-0 z-[2000] modal-backdrop flex items-center justify-center p-12 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-8xl max-h-full">
            <img src={resolvedPreviewImage || null} className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.4)] border-[12px] border-white animate-in zoom-in-95" onClick={(e) => e.stopPropagation()} />
            <button className="absolute -top-6 -right-6 bg-slate-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-all shadow-2xl" onClick={() => setPreviewImage(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

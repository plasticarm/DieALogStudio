import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SavedComicStrip, TextField, ComicProfile, RatedComic } from '../types';
import { downloadImage } from '../services/utils';
import { downscaleImage } from '../utils/imageUtils';
import { CachedImage } from './CachedImage';
import { imageStore } from '../services/imageStore';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { COMIC_FONTS, CANNED_PHRASES } from '../constants';

const getFontFamily = (fontName: string) => {
  const font = COMIC_FONTS.find(f => f.name === fontName);
  return font ? font.family : 'Inter, sans-serif';
};

interface TestingLabProps {
  activeComic: ComicProfile;
  history: SavedComicStrip[];
  onUpdateHistoryItem: (strip: SavedComicStrip) => void;
  onAddRating: (rating: RatedComic) => void;
  contrastColor: string;
  globalColor: string;
}

export const TestingLab: React.FC<TestingLabProps> = ({
  activeComic,
  history,
  onUpdateHistoryItem,
  onAddRating,
  contrastColor,
  globalColor
}) => {
  const filteredHistory = useMemo(() => 
    history.filter(s => s.comicProfileId === activeComic.id),
    [history, activeComic.id]
  );

  const [selectedStripId, setSelectedStripId] = useState<string | null>(
    filteredHistory.length > 0 ? filteredHistory[0].id : null
  );

  const selectedStrip = useMemo(() => 
    filteredHistory.find(s => s.id === selectedStripId),
    [filteredHistory, selectedStripId]
  );

  const [localTextFields, setLocalTextFields] = useState<TextField[]>([]);
  const [usedHints, setUsedHints] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [branches, setBranches] = useState(30);
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  const [viewMode, setViewMode] = useState<'panel' | 'full'>('panel');
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);

  const navigationTargets = useMemo(() => {
    if (!selectedStrip) return [];
    // If we have text fields, use them as primary navigation targets, sorted by order
    if (localTextFields.length > 0) {
      return [...localTextFields]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(tf => ({ x: tf.x, y: tf.y, width: tf.width, height: tf.height, id: tf.id, overridePanZoom: tf.overridePanZoom }));
    }
    // Fallback to panel layout if no text fields
    if (selectedStrip.panelLayout && selectedStrip.panelLayout.length > 0) {
      return selectedStrip.panelLayout.map(p => ({ x: p.x, y: p.y, width: p.width, height: p.height, id: `panel-${p.panelNumber}`, overridePanZoom: p.overridePanZoom }));
    }
    return [];
  }, [selectedStrip, localTextFields]);

  const focusTarget = useMemo(() => {
    if (viewMode !== 'panel' || navigationTargets.length === 0) return null;
    return navigationTargets[currentTargetIndex] || null;
  }, [viewMode, navigationTargets, currentTargetIndex]);

  const listRef = useRef<HTMLDivElement>(null);
  const transformComponentRef = useRef<any>(null);

  const handleNext = () => {
    if (navigationTargets.length === 0) return;
    if (viewMode === 'full') {
      setViewMode('panel');
      setCurrentTargetIndex(0);
    } else if (currentTargetIndex === navigationTargets.length - 1) {
      setViewMode('full');
    } else {
      setCurrentTargetIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (navigationTargets.length === 0) return;
    if (viewMode === 'full') {
      setViewMode('panel');
      setCurrentTargetIndex(navigationTargets.length - 1);
    } else if (currentTargetIndex === 0) {
      setViewMode('full');
    } else {
      setCurrentTargetIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, navigationTargets.length, currentTargetIndex]);

  useEffect(() => {
    if (viewMode === 'panel' && focusTarget && transformComponentRef.current) {
      const { zoomToElement, setTransform } = transformComponentRef.current;
      if (focusTarget.overridePanZoom) {
        const { positionX, positionY, scale } = focusTarget.overridePanZoom;
        setTimeout(() => {
          setTransform(positionX, positionY, scale, 500, "easeOut");
        }, 50);
      } else {
        const scale = Math.max(1, Math.min(80 / focusTarget.width, 80 / focusTarget.height, 5));
        setTimeout(() => {
          zoomToElement(`target-${focusTarget.id}`, scale, 500, "easeOut");
        }, 50);
      }
    } else if (viewMode === 'full' && transformComponentRef.current) {
      const { resetTransform } = transformComponentRef.current;
      resetTransform(500, "easeOut");
    }
  }, [focusTarget, viewMode]);

  useEffect(() => {
    if (viewMode === 'panel' && focusTarget && listRef.current) {
      let targetTfId: string | null = null;
      if (focusTarget.id.startsWith('panel-')) {
        const panelNum = parseInt(focusTarget.id.replace('panel-', ''));
        const tf = localTextFields.find(t => {
          const pNum = selectedStrip?.script?.find(p => p.dialogue.some(d => d.id === t.dialogueId))?.panelNumber;
          return pNum === panelNum;
        });
        if (tf) targetTfId = tf.id;
      } else {
        targetTfId = focusTarget.id;
      }

      if (targetTfId) {
        const el = document.getElementById(`tf-${targetTfId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [focusTarget, localTextFields, selectedStrip, viewMode]);

  const handleFieldClick = (tf: TextField) => {
    if (viewMode === 'panel') {
      const pNum = selectedStrip?.script?.find(p => p.dialogue.some(d => d.id === tf.dialogueId))?.panelNumber;
      if (pNum && selectedStrip?.panelLayout) {
        const panelIdx = selectedStrip.panelLayout.findIndex(p => p.panelNumber === pNum);
        if (panelIdx !== -1) {
          setCurrentTargetIndex(panelIdx);
          return;
        }
      }
      const tfIdx = navigationTargets.findIndex(t => t.id === tf.id);
      if (tfIdx !== -1) {
        setCurrentTargetIndex(tfIdx);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (selectedStrip) {
      // Use the first selected font from the active comic's profile, or fallback to 'Amatic SC'
      const primaryFont = activeComic.selectedFonts?.[0] || 'Amatic SC';
      
      setLocalTextFields((selectedStrip.textFields || []).map(tf => ({ 
        ...tf, 
        // If the text field already has a font set, keep it. Otherwise use the primary font.
        // Also check if the current font is still in the selected list, if not, update it.
        font: (tf.font && activeComic.selectedFonts?.includes(tf.font)) ? tf.font : primaryFont 
      })));
    } else {
      setLocalTextFields([]);
    }
  }, [selectedStrip, activeComic.selectedFonts]);

  const handleUpdateText = (id: string, text: string) => {
    setLocalTextFields(prev => prev.map(tf => tf.id === id ? { ...tf, text } : tf));
  };

  const handleCanned = (tfId: string) => {
    if (branches <= 0) return;
    
    const randomPhrase = CANNED_PHRASES[Math.floor(Math.random() * CANNED_PHRASES.length)];
    const tf = localTextFields.find(t => t.id === tfId);
    if (tf) {
      const match = tf.text.match(/^[^:]+:\s*/);
      const prefix = match ? match[0] : '';
      handleUpdateText(tfId, prefix + randomPhrase);
      setBranches(prev => Math.max(0, prev - 1));
    }
  };

  const handleOverridePanZoom = () => {
    if (!transformComponentRef.current || !focusTarget || !selectedStrip) return;
    
    // Support different versions/structures of react-zoom-pan-pinch
    const state = transformComponentRef.current.state || 
                  transformComponentRef.current.instance?.transformState ||
                  transformComponentRef.current.transformState;
                  
    if (!state) {
      console.error("Could not access transform state from react-zoom-pan-pinch ref");
      return;
    }

    const { scale, positionX, positionY } = state;
    const override = { scale, positionX, positionY };

    if (focusTarget.id.startsWith('panel-')) {
      const panelNum = parseInt(focusTarget.id.replace('panel-', ''));
      const updatedLayout = selectedStrip.panelLayout?.map(p => 
        p.panelNumber === panelNum ? { ...p, overridePanZoom: override } : p
      );
      onUpdateHistoryItem({
        ...selectedStrip,
        textFields: localTextFields,
        panelLayout: updatedLayout
      });
    } else {
      const updatedFields = localTextFields.map(tf => 
        tf.id === focusTarget.id ? { ...tf, overridePanZoom: override } : tf
      );
      setLocalTextFields(updatedFields);
      onUpdateHistoryItem({
        ...selectedStrip,
        textFields: updatedFields
      });
    }
  };

  const handleSave = async () => {
    if (!selectedStrip || isSavingLocal) return;
    setIsSavingLocal(true);
    
    // Penalty for blank fields
    const blankFieldsCount = localTextFields.filter(tf => {
      let cleanText = tf.text;
      const nameMatch = cleanText.match(/^[^:]+:\s*/);
      if (nameMatch) {
        cleanText = cleanText.substring(nameMatch[0].length);
      }
      return !cleanText.trim();
    }).length;

    if (blankFieldsCount > 0) {
      setBranches(prev => Math.max(0, prev - blankFieldsCount));
    }

    // Save the text fields first
    await onUpdateHistoryItem({
      ...selectedStrip,
      textFields: localTextFields
    });

    // Generate composite image for Ratings page
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsSavingLocal(false);
        return;
      }

      const img = new Image();
      
      let imageUrl = selectedStrip.exportImageUrl || selectedStrip.finishedImageUrl;
      if (!imageUrl) {
        throw new Error("No image URL found for this strip.");
      }
      
      try {
        let blobUrl = imageUrl;
        if (imageUrl.startsWith('vault:')) {
          const resolved = await imageStore.getImage(imageUrl);
          if (resolved) blobUrl = resolved;
        } else if (!imageUrl.startsWith('data:')) {
          try {
            const response = await fetch(imageUrl, { mode: 'cors' });
            if (!response.ok) throw new Error('CORS fetch failed');
            const blob = await response.blob();
            blobUrl = URL.createObjectURL(blob);
          } catch (corsError) {
            console.warn("CORS fetch failed in handleSave, trying proxy...", corsError);
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Proxy fetch failed');
            const blob = await response.blob();
            blobUrl = URL.createObjectURL(blob);
          }
        }
        if (!blobUrl.startsWith('data:') && !blobUrl.startsWith('blob:')) {
          img.crossOrigin = "anonymous";
        }
        img.src = blobUrl;
      } catch (e) {
        console.warn("Failed to fetch image as blob in handleSave, falling back to direct src:", e);
        if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
          img.crossOrigin = "anonymous";
        }
        img.src = imageUrl;
      }

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (e) => {
          console.error("Image load error in handleSave:", e);
          reject(new Error("Image failed to load"));
        };
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

        ctx.fillStyle = 'black';
        ctx.textAlign = tf.alignment || 'center';
        ctx.textBaseline = 'middle';
        
        const lines = wrapText(cleanText, w * 0.9);
        const lineHeight = fontSize * 1.2;
        const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          const lineX = tf.alignment === 'left' ? x + w * 0.05 : tf.alignment === 'right' ? x + w * 0.95 : x + w / 2;
          ctx.fillText(line, lineX, startY + i * lineHeight);
        });
      });

      const compositeUrl = canvas.toDataURL('image/png');
      const compressedUrl = await downscaleImage(compositeUrl, 1200, 0.6);
      
      const newRating: RatedComic = {
        id: `rc_${Date.now()}`,
        comicProfileId: activeComic.id,
        stripId: selectedStrip.id,
        imageUrl: compressedUrl,
        rating: 0,
        timestamp: Date.now(),
        name: selectedStrip.name
      };

      await onAddRating(newRating);
      alert("Successfully submitted to Play Mode!");
    } catch (err) {
      console.error("Critical failure in handleSave (TestingLab):", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Failed to submit to Play Mode. Error: ${errorMessage}`);
    } finally {
      setIsSavingLocal(false);
    }
  };

  const exportPng = async () => {
    if (!selectedStrip) return;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      
      let imageUrl = selectedStrip.exportImageUrl || selectedStrip.finishedImageUrl;
      
      try {
        let blobUrl = imageUrl;
        if (imageUrl.startsWith('vault:')) {
          const resolved = await imageStore.getImage(imageUrl);
          if (resolved) blobUrl = resolved;
        } else if (!imageUrl.startsWith('data:')) {
          try {
            const response = await fetch(imageUrl, { mode: 'cors' });
            if (!response.ok) throw new Error('CORS fetch failed');
            const blob = await response.blob();
            blobUrl = URL.createObjectURL(blob);
          } catch (corsError) {
            console.warn("CORS fetch failed, trying proxy...", corsError);
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Proxy fetch failed');
            const blob = await response.blob();
            blobUrl = URL.createObjectURL(blob);
          }
        }
        if (!blobUrl.startsWith('data:') && !blobUrl.startsWith('blob:')) {
          img.crossOrigin = "anonymous";
        }
        img.src = blobUrl;
      } catch (e) {
        console.warn("Failed to fetch image as blob, falling back to direct src:", e);
        if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
          img.crossOrigin = "anonymous";
        }
        img.src = imageUrl;
      }

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for testing lab.'));
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      localTextFields.forEach(tf => {
        const x = (tf.x / 100) * canvas.width;
        const y = (tf.y / 100) * canvas.height;
        const w = (tf.width / 100) * canvas.width;
        const h = (tf.height / 100) * canvas.height;

        // Strip character name if it exists at the start (e.g. "John: Hello" -> "Hello")
        let cleanText = tf.text;
        const nameMatch = cleanText.match(/^[^:]+:\s*/);
        if (nameMatch) {
          cleanText = cleanText.substring(nameMatch[0].length);
        }

        // Find best font size
        const fontName = tf.font || 'Inter';
        const fontFamily = getFontFamily(fontName).replace(/,.*$/, '').replace(/"/g, '');
        
        let fontSize = h; // Start with the maximum possible height
        ctx.font = `${fontSize}px "${fontFamily}"`;
        
        const wrapText = (text: string, maxWidth: number) => {
          const words = text.split(' ');
          const lines = [];
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

        // Adjust font size to fit
        while (fontSize > 8) {
          ctx.font = `${fontSize}px "${fontFamily}"`;
          const lines = wrapText(cleanText, w * 0.9);
          const totalHeight = lines.length * fontSize * 1.2;
          const maxLineWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
          
          if (totalHeight <= h * 0.9 && maxLineWidth <= w * 0.9) break;
          fontSize -= 1;
        }

        ctx.fillStyle = 'black';
        ctx.textAlign = tf.alignment || 'center';
        ctx.textBaseline = 'middle';
        
        const lines = wrapText(cleanText, w * 0.9);
        const lineHeight = fontSize * 1.2;
        const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          const lineX = tf.alignment === 'left' ? x + w * 0.05 : tf.alignment === 'right' ? x + w * 0.95 : x + w / 2;
          ctx.fillText(line, lineX, startY + i * lineHeight);
        });
      });

      const dataUrl = canvas.toDataURL('image/png');
      downloadImage(dataUrl, `${selectedStrip.name}_test_export.png`);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. The image might be corrupted or inaccessible.");
    }
  };

  const renderTextField = (tf: TextField) => {
    // Strip character name if it exists at the start (e.g. "John: Hello" -> "Hello")
    let cleanText = tf.text;
    const nameMatch = cleanText.match(/^[^:]+:\s*/);
    if (nameMatch) {
      cleanText = cleanText.substring(nameMatch[0].length);
    }

    return (
      <div
        key={tf.id}
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          left: `${tf.x}%`,
          top: `${tf.y}%`,
          width: `${tf.width}%`,
          height: `${tf.height}%`,
          textAlign: tf.alignment || 'center',
        }}
      >
        <div 
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{
            fontFamily: getFontFamily(tf.font),
            color: 'black',
            lineHeight: 0.9,
            borderRadius: tf.rounding ? `${tf.rounding}px` : '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background to see the rounding
          }}
        >
          <AutoResizingText key={`${selectedStripId}-${tf.id}`} text={cleanText} alignment={tf.alignment} font={tf.font} rounding={tf.rounding} />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden" style={{ backgroundColor: globalColor }}>
      <div className="flex justify-between items-end mb-2 border-b border-black/5 pb-2">
        <div>
          <h2 className={`text-4xl font-header tracking-tight uppercase ${contrastColor}`}>Testing Lab</h2>
          <p className={`${contrastColor} opacity-70 font-medium text-sm italic`}>Validating narrative flow and text fitting for <span className="font-black underline">{activeComic.name}</span>.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`flex flex-col items-center px-4 py-2 bg-white/20 rounded-2xl border border-white/10 backdrop-blur-sm ${branches <= 5 ? 'animate-pulse text-rose-500' : contrastColor}`}>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50">Branches</span>
              <span className="text-2xl font-mono font-bold tabular-nums">{branches}</span>
            </div>
            <div className={`flex flex-col items-center px-4 py-2 bg-white/20 rounded-2xl border border-white/10 backdrop-blur-sm ${timeLeft < 30 ? 'animate-pulse text-rose-500' : contrastColor}`}>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50">Session Time</span>
              <span className="text-2xl font-mono font-bold tabular-nums">{formatTime(timeLeft)}</span>
            </div>
            <button 
              onClick={() => {
                setTimeLeft(180);
                setBranches(30);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/10 hover:bg-white/20 transition-all ${contrastColor}`}
              title="Restart Session"
            >
              <i className="fa-solid fa-rotate-right text-xs"></i>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={isSavingLocal}
              className={`bg-amber-800 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all flex items-center gap-2 ${isSavingLocal ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-900'}`}
            >
              {isSavingLocal ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </button>
            <button 
              onClick={exportPng}
              className="bg-stone-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-stone-700 transition-all"
            >
              Export PNG
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Page Selection - Numbers with Hover Thumbnails */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-[10px] font-black uppercase tracking-widest mr-2 ${contrastColor} opacity-50`}>Pages:</span>
        {filteredHistory.map((strip, idx) => (
          <div key={strip.id} className="relative group">
            <button
              onClick={() => setSelectedStripId(strip.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                selectedStripId === strip.id 
                  ? 'bg-slate-800 text-white shadow-xl scale-110 z-10' 
                  : 'bg-white/30 text-slate-700 hover:bg-white/50'
              }`}
            >
              {idx + 1}
            </button>
            {/* Hover Thumbnail */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform translate-y-2 group-hover:translate-y-0 z-50 bg-slate-200">
              <CachedImage src={strip.finishedImageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-[8px] font-black text-white uppercase truncate">
                {strip.name}
              </div>
            </div>
          </div>
        ))}
        {filteredHistory.length === 0 && (
          <div className={`text-center py-2 opacity-30 ${contrastColor} w-full`}>
            <p className="text-[10px] font-black uppercase tracking-widest">No pages found</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedStrip ? (
          <div className="flex-1 flex gap-4 overflow-hidden bg-white/10 rounded-[2.5rem] border border-white/10">
            {/* Text Editor */}
            <div className="w-80 bg-white rounded-3xl border border-slate-200 shadow-xl p-5 flex flex-col gap-4 overflow-hidden">
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">DiE-A-Log Editor</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('panel')}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${viewMode === 'panel' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Panel
                  </button>
                  <button 
                    onClick={() => setViewMode('full')}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${viewMode === 'full' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Full
                  </button>
                </div>
              </div>
              <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {localTextFields
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((tf, idx, arr) => {
                    const character = activeComic.characters.find(c => c.name === tf.characterName);
                    const isHintUsed = usedHints.has(tf.id);
                    
                    const getPanel = (tf: TextField) => selectedStrip?.script?.find(p => p.dialogue.some(d => d.id === tf.dialogueId))?.panelNumber;
                    const currentPanel = getPanel(tf);
                    const prevPanel = idx > 0 ? getPanel(arr[idx-1]) : undefined;
                    const showDivider = currentPanel !== undefined && currentPanel !== prevPanel;

                    // Check if this text field is currently focused (or its panel is focused)
                    let isFocused = false;
                    if (viewMode === 'panel' && focusTarget) {
                      if (focusTarget.id.startsWith('panel-')) {
                        const panelNum = parseInt(focusTarget.id.replace('panel-', ''));
                        isFocused = currentPanel === panelNum;
                      } else {
                        isFocused = focusTarget.id === tf.id;
                      }
                    }
                  
                  return (
                    <React.Fragment key={tf.id}>
                      {showDivider && (
                        <div className="w-full py-2 flex items-center gap-4 opacity-50">
                          <div className="h-px bg-slate-300 flex-1"></div>
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Panel {currentPanel}</span>
                          <div className="h-px bg-slate-300 flex-1"></div>
                        </div>
                      )}
                      <div 
                        id={`tf-${tf.id}`} 
                        className={`space-y-2 p-2 rounded-xl transition-all cursor-pointer ${isFocused ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'hover:bg-slate-50'}`}
                        onClick={() => handleFieldClick(tf)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {character?.avatarUrl || character?.imageUrl ? (
                              <CachedImage src={character.avatarUrl || character.imageUrl} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt={tf.characterName} />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 border border-slate-200">?</div>
                            )}
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight truncate max-w-[80px]">{tf.characterName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                if (branches <= 0) return;
                                if (tf.dialogueId && selectedStrip.script) {
                                  const dialogue = selectedStrip.script.flatMap(p => p.dialogue).find(d => d.id === tf.dialogueId);
                                  if (dialogue) {
                                    handleUpdateText(tf.id, dialogue.text);
                                    setUsedHints(prev => new Set(prev).add(tf.id));
                                    setBranches(prev => Math.max(0, prev - 1));
                                  } else {
                                    alert("Dialogue ID not found in script.");
                                  }
                                } else if (!tf.dialogueId) {
                                  alert("No Dialogue ID associated with this field. Link it in the Studio first.");
                                }
                              }}
                              disabled={branches <= 0}
                              className={`text-[8px] font-bold px-2 py-1 rounded-full transition-all flex items-center gap-1 shrink-0 ${
                                isHintUsed 
                                  ? 'bg-slate-100 text-slate-400' 
                                  : branches <= 0 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                              }`}
                              title="Fill with original script text"
                            >
                              <i className="fa-solid fa-lightbulb text-[7px]"></i>
                              Hint
                            </button>
                            <button 
                              onClick={() => handleCanned(tf.id)}
                              disabled={branches <= 0}
                              className={`text-[8px] font-bold px-2 py-1 rounded-full transition-all flex items-center gap-1 shrink-0 ${
                                branches <= 0 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                              }`}
                              title="Fill with random canned phrase"
                            >
                              <i className="fa-solid fa-comment-dots text-[7px]"></i>
                              Canned
                            </button>
                            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                              <span className="text-[8px] font-bold text-slate-500 uppercase">Round</span>
                              <input 
                                type="number"
                                value={tf.rounding || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const updatedFields = localTextFields.map(field => 
                                    field.id === tf.id ? { ...field, rounding: val } : field
                                  );
                                  setLocalTextFields(updatedFields);
                                }}
                                className="w-8 bg-transparent text-[9px] font-bold text-slate-700 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <textarea
                          value={tf.text}
                          onChange={(e) => handleUpdateText(tf.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-slate-200 outline-none transition-all resize-none"
                          rows={2}
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

            {/* Preview - Aligned to top */}
            <div className="flex-1 flex items-start justify-center relative overflow-hidden bg-slate-900 rounded-3xl">
              {navigationTargets.length > 0 && (
                <>
                  {viewMode === 'panel' && (
                    <div className="absolute top-4 left-4 flex gap-2 z-50">
                      <button 
                        onClick={handleOverridePanZoom}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                      >
                        Override Panel View
                      </button>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2 z-50">
                    <button 
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg transition-all"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button 
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg transition-all"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                </>
              )}
              
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={10}
                centerOnInit
                wheel={{ step: 0.1 }}
                ref={transformComponentRef}
                disabled={viewMode === 'full'}
              >
                {() => (
                  <TransformComponent wrapperClass="w-full h-full flex items-center justify-center" contentClass="w-full h-full flex items-center justify-center">
                    <div 
                      className="relative overflow-hidden bg-white shrink-0" 
                      style={{ 
                        aspectRatio: '16/9', 
                        width: '100%', 
                        maxWidth: '100%',
                      }}
                    >
                      <CachedImage 
                        src={selectedStrip.exportImageUrl || selectedStrip.finishedImageUrl} 
                        className="w-full h-full object-contain" 
                      />
                      
                      {/* Invisible Target Divs for Zooming */}
                      {navigationTargets.map(target => (
                        <div
                          key={target.id}
                          id={`target-${target.id}`}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${target.x}%`,
                            top: `${target.y}%`,
                            width: `${target.width}%`,
                            height: `${target.height}%`
                          }}
                        />
                      ))}

                      {/* Text Overlay */}
                      {localTextFields.map(tf => renderTextField(tf))}
                    </div>
                  </TransformComponent>
                )}
              </TransformWrapper>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-20">
            <div className="text-center">
              <i className="fa-solid fa-vial-circle-check text-8xl mb-6 block"></i>
              <p className="text-2xl font-header uppercase tracking-widest">Select a page to begin testing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AutoResizingText: React.FC<{ text: string, alignment: string, font: string, rounding?: number }> = ({ text, alignment, font, rounding }) => {
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

    // Use ResizeObserver to catch when the container becomes visible or changes size
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
        padding: '8%',
        lineHeight: 0.9,
        borderRadius: rounding ? `${rounding}px` : '1rem'
      }}
    >
      <div className="w-full relative">
        <div 
          className="float-left h-full w-[15%] pointer-events-none" 
          style={{ shapeOutside: 'polygon(100% 0, 0 50%, 100% 100%)' }}
        />
        <div 
          className="float-right h-full w-[15%] pointer-events-none" 
          style={{ shapeOutside: 'polygon(0 0, 100% 50%, 0 100%)' }}
        />
        {text}
      </div>
    </div>
  );
};

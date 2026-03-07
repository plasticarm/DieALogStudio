import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SavedComicStrip, TextField, ComicProfile, RatedComic } from '../types';
import { downloadImage } from '../services/utils';
import { downscaleImage } from '../utils/imageUtils';
import { CachedImage } from './CachedImage';
import { imageStore } from '../services/imageStore';
import { COMIC_FONTS } from '../constants';

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
  const [isSavingLocal, setIsSavingLocal] = useState(false);

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

  const handleSave = async () => {
    if (!selectedStrip || isSavingLocal) return;
    setIsSavingLocal(true);
    
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
      img.crossOrigin = "anonymous";
      
      let imageUrl = selectedStrip.exportImageUrl || selectedStrip.finishedImageUrl;
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
      console.error("Failed to generate composite for rating:", err);
      alert("Failed to submit to Play Mode.");
    } finally {
      setIsSavingLocal(false);
    }
  };

  const exportPng = async () => {
    if (!selectedStrip) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    let imageUrl = selectedStrip.exportImageUrl || selectedStrip.finishedImageUrl;
    if (imageUrl.startsWith('vault:')) {
      const resolved = await imageStore.getImage(imageUrl);
      if (resolved) imageUrl = resolved;
    }
    
    img.src = imageUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
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
      
      let fontSize = 40 * (canvas.height / 1000);
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

    const dataUrl = canvas.toDataURL('image/png');
    downloadImage(dataUrl, `${selectedStrip.name}_test_export.png`);
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
            lineHeight: 0.8,
          }}
        >
          <AutoResizingText key={`${selectedStripId}-${tf.id}`} text={cleanText} alignment={tf.alignment} font={tf.font} />
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
            <div className={`flex flex-col items-center px-4 py-2 bg-white/20 rounded-2xl border border-white/10 backdrop-blur-sm ${timeLeft < 30 ? 'animate-pulse text-rose-500' : contrastColor}`}>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50">Session Time</span>
              <span className="text-2xl font-mono font-bold tabular-nums">{formatTime(timeLeft)}</span>
            </div>
            <button 
              onClick={() => setTimeLeft(180)}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/10 hover:bg-white/20 transition-all ${contrastColor}`}
              title="Restart Timer"
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
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest shrink-0">DiE-A-Log Editor</h3>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {localTextFields
                  .sort((a, b) => {
                    if (!selectedStrip?.script) return 0;
                    const getPanel = (tf: TextField) => selectedStrip.script.find(p => p.dialogue.some(d => d.id === tf.dialogueId))?.panelNumber || 999;
                    return getPanel(a) - getPanel(b);
                  })
                  .map((tf, idx, arr) => {
                    const character = activeComic.characters.find(c => c.name === tf.characterName);
                    const isHintUsed = usedHints.has(tf.id);
                    
                    const getPanel = (tf: TextField) => selectedStrip?.script?.find(p => p.dialogue.some(d => d.id === tf.dialogueId))?.panelNumber;
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
                      <div className="space-y-2">
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
                              if (tf.dialogueId && selectedStrip.script) {
                                const dialogue = selectedStrip.script.flatMap(p => p.dialogue).find(d => d.id === tf.dialogueId);
                                if (dialogue) {
                                  handleUpdateText(tf.id, dialogue.text);
                                  setUsedHints(prev => new Set(prev).add(tf.id));
                                } else {
                                  alert("Dialogue ID not found in script.");
                                }
                              } else if (!tf.dialogueId) {
                                alert("No Dialogue ID associated with this field. Link it in the Studio first.");
                              }
                            }}
                            className={`text-[8px] font-bold px-2 py-1 rounded-full transition-all flex items-center gap-1 shrink-0 ${
                              isHintUsed 
                                ? 'bg-slate-100 text-slate-400' 
                                : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                            }`}
                            title="Fill with original script text"
                          >
                            <i className="fa-solid fa-lightbulb text-[7px]"></i>
                            Hint
                          </button>
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
            <div className="flex-1 flex items-start justify-center relative overflow-hidden">
              <div className="relative overflow-hidden bg-white shrink-0" style={{ aspectRatio: '16/9', width: '100%', maxWidth: '100%' }}>
                <CachedImage 
                  src={selectedStrip.exportImageUrl || selectedStrip.finishedImageUrl} 
                  className="w-full h-full object-contain" 
                />
                
                {/* Text Overlay */}
                {localTextFields.map(tf => renderTextField(tf))}
              </div>
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
        padding: '6%' 
      }}
    >
      {text}
    </div>
  );
};

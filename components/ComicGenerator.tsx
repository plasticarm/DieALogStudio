import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ComicProfile, GeneratedPanelScript, SavedComicStrip, ArtModelType, TextField, PanelLayout } from '../types';
import { generateComicScript, generateComicArt, removeTextFromComic, detectComicPanels } from '../services/gemini';
import { downloadImage, downloadJSON } from '../services/utils';
import { downscaleImage } from '../utils/imageUtils';
import { imageStore } from '../services/imageStore';
import { CachedImage } from './CachedImage';
import { COMIC_FONTS } from '../constants';

interface ComicGeneratorProps {
  activeComic: ComicProfile;
  allComics: ComicProfile[];
  onSwitchComic: (id: string) => void;
  initialStrip?: SavedComicStrip | null;
  onPreviewImage: (url: string) => void;
  onSaveHistory: (strip: SavedComicStrip) => void;
  onDeleteHistoryItem: (id: string) => void;
  history: SavedComicStrip[];
  contrastColor: string;
  onAdvanceGuide?: (step: number) => void;
}

const getFontFamily = (fontName: string) => {
  const font = COMIC_FONTS.find(f => f.name === fontName);
  return font ? font.family : 'Inter, sans-serif';
};

const EditableBubble: React.FC<{ 
  text: string, 
  alignment: string, 
  font: string, 
  fontSize: number,
  rounding?: number,
  onChange: (text: string) => void,
  onFocus?: () => void
}> = ({ text, alignment, font, fontSize, rounding, onChange, onFocus }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && containerRef.current.innerText !== text) {
      if (document.activeElement !== containerRef.current) {
        containerRef.current.innerText = text;
      }
    }
  }, [text]);

  return (
    <div 
      ref={containerRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerText)}
      onFocus={onFocus}
      className="w-full h-full flex items-center justify-center break-words whitespace-pre-wrap overflow-hidden outline-none transition-all cursor-text"
      style={{ 
        textAlign: alignment as any, 
        padding: '8%', 
        lineHeight: 0.9,
        fontSize: `${fontSize}px`,
        fontFamily: getFontFamily(font),
        borderRadius: rounding ? `${rounding}px` : '0px',
        color: '#000'
      }}
    >
      <div className="w-full relative pointer-events-none">
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

export const ComicGenerator: React.FC<ComicGeneratorProps> = ({ 
  activeComic, allComics, onSwitchComic, initialStrip, onPreviewImage, onSaveHistory, onDeleteHistoryItem, history, contrastColor, onAdvanceGuide
}) => {
  const [prompt, setPrompt] = useState(initialStrip?.prompt || '');
  const [panelCount, setPanelCount] = useState(initialStrip?.panelCount || 3);
  const [model, setModel] = useState<ArtModelType>('gemini-3.1-flash-image-preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [script, setScript] = useState<GeneratedPanelScript[] | null>(initialStrip?.script || null);
  const [finishedImage, setFinishedImage] = useState<string | null>(initialStrip?.finishedImageUrl || null);
  const [imageHistory, setImageHistory] = useState<string[]>(initialStrip?.imageHistory || []);
  const [exportImage, setExportImage] = useState<string | null>(initialStrip?.exportImageUrl || null);
  const [activeTab, setActiveTab] = useState<'finished' | 'export' | 'history'>('finished');
  
  const [stripName, setStripName] = useState(initialStrip?.name || 'New Episode');
  const [currentStripId, setCurrentStripId] = useState<string | null>(initialStrip?.id || null);
  const [currentArTargetId, setCurrentArTargetId] = useState<string | null>(initialStrip?.arTargetId || null);

  const [textFields, setTextFields] = useState<TextField[]>(initialStrip?.textFields || []);
  const [panelLayout, setPanelLayout] = useState<PanelLayout[]>(initialStrip?.panelLayout || []);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const [interactionType, setInteractionType] = useState<'none' | 'drawing' | 'moving' | 'resizing' | 'painting'>('none');
  const [interactionStart, setInteractionStart] = useState<{ x: number, y: number, fieldX: number, fieldY: number, fieldW: number, fieldH: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number, y: number } | null>(null);
  const [toolMode, setToolMode] = useState<'select' | 'text' | 'eraser' | 'pan'>('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [removeSpeechBubbles, setRemoveSpeechBubbles] = useState(false);
  const [showCharacterRef, setShowCharacterRef] = useState(false);

  const [isManualCleaning, setIsManualCleaning] = useState(false);
  const [cleaningTool, setCleaningTool] = useState<'brush' | 'polygon' | 'eyedropper' | 'eraser'>('brush');
  const [cleaningColor, setCleaningColor] = useState<string>('#FFFFFF');
  const [brushSize, setBrushSize] = useState(30);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number, y: number }[]>([]);
  const [cleaningHistory, setCleaningHistory] = useState<string[]>([]);
  const manualCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredHistory = useMemo(() => (history || []).filter(s => s && activeComic && s.comicProfileId === activeComic.id), [history, activeComic?.id]);

  useEffect(() => {
    if (initialStrip) {
      setStripName(initialStrip.name);
      setCurrentStripId(initialStrip.id);
      setCurrentArTargetId(initialStrip.arTargetId);
      setScript(initialStrip.script);
      setFinishedImage(initialStrip.finishedImageUrl);
      setExportImage(initialStrip.exportImageUrl || null);
      setTextFields(initialStrip.textFields || []);
      setPanelLayout(initialStrip.panelLayout || []);
      setPrompt(initialStrip.prompt);
      setPanelCount(initialStrip.panelCount);
    }
  }, [initialStrip]);

  useEffect(() => {
    if (isManualCleaning && finishedImage && manualCanvasRef.current) {
      const canvas = manualCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadImage = async () => {
        try {
          const imageUrl = await imageStore.getSafeUrl(finishedImage);
          if (!imageUrl) throw new Error('Could not resolve image.');

          const img = new Image();
          if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
            img.crossOrigin = "anonymous";
          }
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              // If we created a blob URL, revoke it to free memory
              if (imageUrl.startsWith('blob:') && !finishedImage?.startsWith('vault:')) {
                URL.revokeObjectURL(imageUrl);
              }
              resolve(null);
            };
            img.onerror = () => {
              const msg = `Failed to load image from ${imageUrl.substring(0, 60)}... This may be due to CORS restrictions on the source bucket.`;
              reject(new Error(msg));
            };
            img.src = imageUrl;
          });
        } catch (err) {
          console.error("Image loading error:", err);
          setError(`Image loading error: ${err instanceof Error ? err.message : String(err)}`);
          setIsManualCleaning(false);
        }
      };

      loadImage();
    }
  }, [isManualCleaning, finishedImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isManualCleaning && cleaningTool === 'polygon' && polygonPoints.length > 2) {
        finishPolygon();
      }
      if (e.key === 'Escape') {
        setPolygonPoints([]);
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && isManualCleaning) {
        e.preventDefault();
        undoCleaning();
      }
      
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(prev => Math.min(5, prev + 0.1));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(0.2, prev - 0.1));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }

      // Tool shortcuts
      if (activeTab === 'export') {
        if (e.key === 'h' || e.key === 'H') setToolMode('pan');
        if (e.key === 's' || e.key === 'S') setToolMode('select');
        if (e.key === 't' || e.key === 'T') setToolMode('text');
        if (e.key === 'e' || e.key === 'E') setToolMode('eraser');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isManualCleaning, cleaningTool, polygonPoints, activeTab]);

  const saveCleaningState = () => {
    if (!manualCanvasRef.current) return;
    const dataUrl = manualCanvasRef.current.toDataURL();
    setCleaningHistory(prev => [...prev, dataUrl].slice(-20)); // Keep last 20 states
  };

  const undoCleaning = () => {
    if (cleaningHistory.length === 0 || !manualCanvasRef.current) return;
    const canvas = manualCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...cleaningHistory];
    const prevState = newHistory.pop();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (prevState) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.onerror = () => console.error('Failed to load previous state image.');
      img.src = prevState;
    }
    setCleaningHistory(newHistory);
  };

  const finishPolygon = () => {
    if (!manualCanvasRef.current || polygonPoints.length < 3) return;
    saveCleaningState();
    const canvas = manualCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(polygonPoints[0].x * canvas.width / 100, polygonPoints[0].y * canvas.height / 100);
    for (let i = 1; i < polygonPoints.length; i++) {
      ctx.lineTo(polygonPoints[i].x * canvas.width / 100, polygonPoints[i].y * canvas.height / 100);
    }
    ctx.closePath();
    ctx.fillStyle = cleaningColor;
    ctx.fill();
    setPolygonPoints([]);
  };

  const handleGenerateFullComic = async (isRandom: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true); 
    setError(null);
    setStatusMessage('Scripting Plot...');
    
    // Create a timeout promise
    const timeout = (ms: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Generation timed out. The AI architect is busy. Please try again.')), ms)
    );

    try {
      // Script generation with 60s timeout
      const result = await Promise.race([
        generateComicScript(activeComic, prompt, isRandom, panelCount),
        timeout(60000)
      ]) as { title: string; plotDescription: string; script: GeneratedPanelScript[] };
      
      const s = result.script;
      
      if (isRandom) {
        setStripName(result.title);
        setPrompt(result.plotDescription);
      }
      
      setScript(s);
      setStatusMessage('Rendering Visuals...');
      onAdvanceGuide?.(5);
      
      // Art generation with 180s timeout
      const rawImg = await Promise.race([
        generateComicArt(activeComic, s, model),
        timeout(180000)
      ]) as string;
      
      const img = await downscaleImage(rawImg, 1024, 0.8);
      const vaultedImg = await imageStore.vaultify(img);
      
      setFinishedImage(vaultedImg);
      setImageHistory(prev => [vaultedImg, ...prev].slice(0, 10));
      setExportImage(null);
      setTextFields([]);

      // Detect panels
      setStatusMessage('Analyzing Panel Layout...');
      let detectedLayout: PanelLayout[] = [];
      try {
        detectedLayout = await detectComicPanels(img);
      } catch (panelErr) {
        console.warn("Panel detection failed:", panelErr);
      }
      setPanelLayout(detectedLayout);

      setActiveTab('finished');
      setIsManualCleaning(false);
      if (manualCanvasRef.current) {
        const ctx = manualCanvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, manualCanvasRef.current.width, manualCanvasRef.current.height);
      }
      setPolygonPoints([]);

      // Automatically save to history
      const newId = currentStripId || `strip_${Date.now()}`;
      const newArId = currentArTargetId || `DIAL-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setCurrentStripId(newId);
      setCurrentArTargetId(newArId);

      const newStrip: SavedComicStrip = {
        id: newId, 
        arTargetId: newArId,
        name: isRandom ? result.title : stripName, 
        comicProfileId: activeComic.id, 
        prompt: isRandom ? result.plotDescription : prompt, 
        script: s,
        finishedImageUrl: vaultedImg, 
        timestamp: Date.now(), 
        panelCount,
        textFields: [],
        panelLayout: detectedLayout
      };
      onSaveHistory(newStrip);
    } catch (e: any) { 
      console.error(e);
      setError(e.message || 'An unexpected error occurred during production.');
    }
    finally { setIsProcessing(false); setStatusMessage(''); }
  };

  const handleGenerateExport = async () => {
    if (!finishedImage || isProcessing) return;

    if (isManualCleaning) {
      setIsProcessing(true);
      setStatusMessage('Finalizing manual cleanup...');
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx || !manualCanvasRef.current) return;

        // Resolve vault URL if necessary
        const resolvedSrc = await imageStore.getSafeUrl(finishedImage);
        if (!resolvedSrc) throw new Error('Could not resolve image.');

        const img = new Image();
        if (resolvedSrc.startsWith('http') || resolvedSrc.startsWith('blob:')) {
          img.crossOrigin = "anonymous";
        }
        
        img.src = resolvedSrc;
        await img.decode();

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.drawImage(manualCanvasRef.current, 0, 0);

        // Cleanup blob URL if created
        if (resolvedSrc.startsWith('blob:') && !finishedImage.startsWith('vault:')) {
          URL.revokeObjectURL(resolvedSrc);
        }

        const flattened = canvas.toDataURL('image/png');
        const imgDownscaled = await downscaleImage(flattened, 1024, 0.8);
        const vaultedImg = await imageStore.vaultify(imgDownscaled);
        setExportImage(vaultedImg);
        setActiveTab('export');
        setIsManualCleaning(false);
      } catch (e: any) {
        console.error(e);
        alert(`Manual cleanup failed: ${e.message}`);
      } finally {
        setIsProcessing(false);
        setStatusMessage('');
      }
      return;
    }

    setIsProcessing(true); setStatusMessage('Extracting clean plate...');
    try {
      const rawImg = await removeTextFromComic(finishedImage, model, { removeSpeechBubbles });
      const img = await downscaleImage(rawImg, 1024, 0.8);
      setExportImage(img); 
      setActiveTab('export');
      onAdvanceGuide?.(7);
    } catch (e: any) { 
      console.error(e);
      alert(`Export failed: ${e.message}`); 
    }
    finally { setIsProcessing(false); setStatusMessage(''); }
  };

  const loadStrip = (s: SavedComicStrip) => {
    setFinishedImage(s.finishedImageUrl);
    setImageHistory(s.imageHistory || []);
    setExportImage(s.exportImageUrl || null);
    setScript(s.script);
    setStripName(s.name);
    setPrompt(s.prompt);
    setPanelCount(s.panelCount);
    setTextFields(s.textFields || []);
    setPanelLayout(s.panelLayout || []);
    setCurrentStripId(s.id);
    setCurrentArTargetId(s.arTargetId);
    setActiveTab('finished');
  };

  const saveToHistory = () => {
    if (!finishedImage || !script) return;
    const newStrip: SavedComicStrip = {
      id: currentStripId || `strip_${Date.now()}`, 
      arTargetId: currentArTargetId || `DIAL-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: stripName, 
      comicProfileId: activeComic.id, 
      prompt, 
      script,
      finishedImageUrl: finishedImage, 
      imageHistory: imageHistory,
      exportImageUrl: exportImage || undefined, 
      timestamp: Date.now(), 
      panelCount,
      textFields,
      panelLayout
    };
    onSaveHistory(newStrip);
    if (!currentStripId) setCurrentStripId(newStrip.id);
    if (!currentArTargetId) setCurrentArTargetId(newStrip.arTargetId);
    onAdvanceGuide?.(6);
    alert('Asset saved to Library.');
  };

  const getRelativeCoords = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const pickColor = async (e: React.MouseEvent) => {
    if (!containerRef.current || !finishedImage) return;

    // Try using the EyeDropper API if available
    if ('EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        setCleaningColor(result.sRGBHex);
        setCleaningTool('brush');
        return;
      } catch (err) {
        // User canceled or error, fallback to canvas method
      }
    }

    // Fallback: draw image to offscreen canvas and get pixel
    try {
      const coords = getRelativeCoords(e);
      const imageUrl = await imageStore.getSafeUrl(finishedImage);
      if (!imageUrl) return;

      const img = new Image();
      if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
        img.crossOrigin = "anonymous";
      }
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          
          // Also draw the manual cleaning canvas over it to pick up any existing edits
          if (manualCanvasRef.current) {
            ctx.drawImage(manualCanvasRef.current, 0, 0);
          }

          const x = Math.floor((coords.x / 100) * canvas.width);
          const y = Math.floor((coords.y / 100) * canvas.height);
          
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const rgbToHex = (r: number, g: number, b: number) => {
            return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
          };
          setCleaningColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
          setCleaningTool('brush');
          
          if (imageUrl.startsWith('blob:') && !finishedImage?.startsWith('vault:')) {
            URL.revokeObjectURL(imageUrl);
          }
          resolve(null);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image for color picking.'));
        };
        img.src = imageUrl;
      });
    } catch (err) {
      console.error("Failed to pick color:", err);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStatusMessage('Uploading comic...');
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = await downscaleImage(dataUrl, 1024, 0.8);
      const vaultedImg = await imageStore.vaultify(img);
      
      setFinishedImage(vaultedImg);
      setImageHistory(prev => [vaultedImg, ...prev].slice(0, 10));
      setExportImage(null);
      setTextFields([]);
      setActiveTab('finished');
      
      // Create a default script or empty script for uploaded comics
      const emptyScript: GeneratedPanelScript[] = [
        { panelNumber: 1, visualDescription: 'Uploaded Comic', dialogue: [] }
      ];
      setScript(emptyScript);

      const newId = `strip_up_${Date.now()}`;
      const newArId = `DIAL-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setCurrentStripId(newId);
      setCurrentArTargetId(newArId);

      const newStrip: SavedComicStrip = {
        id: newId, 
        arTargetId: newArId,
        name: file.name.replace(/\.[^/.]+$/, "") || 'Uploaded Comic', 
        comicProfileId: activeComic.id, 
        prompt: 'Manual Upload', 
        script: emptyScript,
        finishedImageUrl: vaultedImg, 
        timestamp: Date.now(), 
        panelCount: 1,
        textFields: []
      };
      onSaveHistory(newStrip);
      setStatusMessage('Comic uploaded successfully!');
      setTimeout(() => setStatusMessage(''), 2000);
    } catch (e: any) {
      console.error(e);
      setError('Failed to upload image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (toolMode === 'pan' || (e.button === 1)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const coords = getRelativeCoords(e);

    if (isManualCleaning && activeTab === 'finished') {
      if (cleaningTool === 'eyedropper') {
        pickColor(e);
        return;
      }
      if (cleaningTool === 'brush' || cleaningTool === 'eraser') {
        saveCleaningState();
        setInteractionType('painting');
        paintAt(coords.x, coords.y);
      } else if (cleaningTool === 'polygon') {
        setPolygonPoints(prev => [...prev, coords]);
      }
      return;
    }

    if (activeTab !== 'export' || !containerRef.current || isProcessing) return;

    if (toolMode === 'text') {
      setInteractionType('drawing');
      setInteractionStart({ x: coords.x, y: coords.y, fieldX: 0, fieldY: 0, fieldW: 0, fieldH: 0 });
      setDrawCurrent({ x: coords.x, y: coords.y });
    } else if (toolMode === 'eraser') {
      if (!isManualCleaning) {
        setIsManualCleaning(true);
        setCleaningTool('eraser');
      }
      saveCleaningState();
      setInteractionType('painting');
      paintAt(coords.x, coords.y);
    } else {
      setSelectedFieldId(null);
    }
  };

  const paintAt = (x: number, y: number) => {
    if (!manualCanvasRef.current) return;
    const canvas = manualCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cleaningTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = cleaningColor;
    }
    
    ctx.beginPath();
    ctx.arc(x * canvas.width / 100, y * canvas.height / 100, brushSize * (canvas.width / 1000), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const handleFieldInteractionStart = (e: React.MouseEvent, field: TextField, type: 'moving' | 'resizing') => {
    e.stopPropagation();
    if (activeTab !== 'export' || isProcessing) return;
    
    const coords = getRelativeCoords(e);
    setSelectedFieldId(field.id);
    setInteractionType(type);
    setInteractionStart({ 
      x: coords.x, 
      y: coords.y, 
      fieldX: field.x, 
      fieldY: field.y, 
      fieldW: field.width, 
      fieldH: field.height 
    });
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (isManualCleaning) {
      const coords = getRelativeCoords(e);
      setMousePos({ x: coords.x, y: coords.y });
    }
    if (interactionType === 'none' || !interactionStart) {
      if (interactionType === 'painting' && isManualCleaning) {
        const coords = getRelativeCoords(e);
        paintAt(coords.x, coords.y);
      }
      return;
    }
    const coords = getRelativeCoords(e);

    if (interactionType === 'drawing') {
      setDrawCurrent({ x: coords.x, y: coords.y });
    } else if (interactionType === 'moving' && selectedFieldId) {
      const dx = coords.x - interactionStart.x;
      const dy = coords.y - interactionStart.y;
      updateField(selectedFieldId, {
        x: Math.max(0, Math.min(100 - interactionStart.fieldW, interactionStart.fieldX + dx)),
        y: Math.max(0, Math.min(100 - interactionStart.fieldH, interactionStart.fieldY + dy))
      });
    } else if (interactionType === 'resizing' && selectedFieldId) {
      const dx = coords.x - interactionStart.x;
      const dy = coords.y - interactionStart.y;
      updateField(selectedFieldId, {
        width: Math.max(5, Math.min(100 - interactionStart.fieldX, interactionStart.fieldW + dx)),
        height: Math.max(5, Math.min(100 - interactionStart.fieldY, interactionStart.fieldH + dy))
      });
    }
  };

  const handleContainerMouseUp = () => {
    setIsPanning(false);
    if (interactionType === 'drawing' && interactionStart && drawCurrent) {
      const x = Math.min(interactionStart.x, drawCurrent.x);
      const y = Math.min(interactionStart.y, drawCurrent.y);
      const width = Math.abs(interactionStart.x - drawCurrent.x);
      const height = Math.abs(interactionStart.y - drawCurrent.y);

        if (width > 2 && height > 2) {
        const newId = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newField: TextField = {
          id: newId, text: 'New Dialogue', x, y, width, height,
          font: activeComic.selectedFonts?.[0] || 'Amatic SC', fontSize: 12, alignment: 'center', characterName: 'Unknown',
          order: textFields.length + 1
        };
        setTextFields(prev => [...prev, newField]);
        setSelectedFieldId(newId);
      }
    }
    setInteractionType('none');
    setInteractionStart(null);
    setDrawCurrent(null);
  };

  const updateField = (id: string, updates: Partial<TextField>) => {
    setTextFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteSelectedField = () => {
    if (!selectedFieldId) return;
    setTextFields(prev => prev.filter(f => f.id !== selectedFieldId));
    setSelectedFieldId(null);
  };

  const handleCopyPrompt = () => {
    if (!script) return;
    const panelsDesc = script.map(p => {
      const dialogueText = (p.dialogue || []).map(d => `${d.character}: ${d.text}`).join(' | ');
      return `Panel ${p.panelNumber}: ${p.visualDescription}. Dialogue: ${dialogueText}`;
    }).join('\n');
    
    const promptText = `A horizontal comic strip with ${script.length} panels.
Series: ${activeComic.name}
Aesthetic: ${activeComic.artStyle}
Action: ${panelsDesc}
Note: Highly cinematic, clear panel borders, gutters, professional comic book layout. Explicitly include speech bubbles and dialogue as described in the action. Ensure the text is legible and correctly attributed to the characters.`;

    navigator.clipboard.writeText(promptText).then(() => {
      setStatusMessage('Prompt copied to clipboard!');
      setTimeout(() => setStatusMessage(''), 3000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleFlattenExport = async () => {
    if (!exportImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageUrl = await imageStore.getSafeUrl(exportImage);
      if (!imageUrl) throw new Error('Could not resolve image.');

      const img = new Image();
      if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) {
        img.crossOrigin = "anonymous";
      }
      img.src = imageUrl;
      await img.decode();

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const scale = canvas.width / 1000;

      textFields.forEach(field => {
        ctx.save();
        const fx = (field.x / 100) * canvas.width;
        const fy = (field.y / 100) * canvas.height;
        const fw = (field.width / 100) * canvas.width;
        
        const fSize = field.fontSize * scale;
        ctx.font = `bold ${fSize}px "${field.font}"`;
        ctx.textAlign = field.alignment;
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000000';

        const words = field.text.split(/\s+/);
        let line = '';
        let lines = [];
        
        for(let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > fw && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        let alignX = fx;
        if (field.alignment === 'center') alignX = fx + fw / 2;
        if (field.alignment === 'right') alignX = fx + fw;

        lines.forEach((l, i) => {
          ctx.fillText(l.trim(), alignX, fy + (i * fSize * 0.8));
        });
        ctx.restore();
      });

      const flattened = canvas.toDataURL('image/png');
      downloadImage(flattened, `${stripName.replace(/\s+/g, '_')}_final.png`);
      
      if (imageUrl.startsWith('blob:') && !exportImage.startsWith('vault:')) {
        URL.revokeObjectURL(imageUrl);
      }
    } catch (e) {
      console.error(e);
      alert("Flattening failed.");
    }
  };

  const handleExportManifest = () => {
    const pageId = initialStrip?.arTargetId || 'TMP';
    const manifest = {
      series: activeComic.name,
      strip: stripName,
      arTargetId: pageId,
      timestamp: Date.now(),
      layout: textFields.map((f, idx) => ({
        ...f,
        uniqueId: `${activeComic.name.replace(/\s+/g, '_')}_${pageId}_${f.characterName.replace(/\s+/g, '')}_${idx + 1}`
      }))
    };
    downloadJSON(manifest, `${stripName.replace(/\s+/g, '_')}_AR_manifest.json`);
  };

  const selectedField = useMemo(() => textFields.find(f => f.id === selectedFieldId), [textFields, selectedFieldId]);

  return (
    <div className={`h-full flex flex-col transition-all overflow-hidden bg-white ${isMaximized ? 'p-0' : 'p-2 sm:p-6'}`}>
      {/* Universal Property Bar */}
      <div className={`bg-white border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-4 flex gap-2 sm:gap-6 items-center shrink-0 shadow-sm z-[200]`}>
        <div className="flex-1 flex items-center gap-4 overflow-hidden">
           <div className="flex flex-col shrink-0">
             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 hidden sm:block">Production Series</label>
             <select 
               value={activeComic.id}
               onChange={(e) => onSwitchComic(e.target.value)}
               className="bg-slate-50 border border-slate-200 rounded-lg px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-black uppercase text-slate-800 outline-none focus:ring-2 focus:ring-slate-200 transition-all max-w-[100px] sm:max-w-[180px]"
             >
               {allComics?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>
           <div className="h-6 w-[1px] bg-slate-200 shrink-0"></div>
           <div className="flex flex-col flex-1 min-w-0">
             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 hidden sm:block">Episode Title</label>
             <div className="flex items-center gap-1 sm:gap-3">
               <input 
                 type="text" 
                 value={stripName} 
                 onChange={e => setStripName(e.target.value)}
                 className="bg-transparent font-bold text-xs sm:text-sm outline-none text-slate-800 focus:text-slate-900 border-b border-transparent focus:border-slate-200 flex-1 min-w-0"
                 placeholder="Untitled Project"
               />
               <button 
                 onClick={() => setShowCharacterRef(true)}
                 className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-1 sm:gap-2 shrink-0"
               >
                 <i className="fa-solid fa-users"></i>
                 <span className="hidden sm:inline">Characters</span>
               </button>
               {filteredHistory.length > 0 && (
                 <select
                   onChange={(e) => {
                     const selected = filteredHistory.find(h => h.id === e.target.value);
                     if (selected) loadStrip(selected);
                   }}
                   value={currentStripId || ''}
                   className="bg-slate-50 border border-slate-200 rounded-lg px-1 sm:px-2 py-1 text-[8px] sm:text-[9px] font-black uppercase text-slate-500 outline-none focus:ring-2 focus:ring-slate-200 transition-all max-w-[80px] sm:max-w-[120px]"
                 >
                   <option key="switch-page-default" value="">Page...</option>
                   {filteredHistory.map(h => (
                     <option key={h.id} value={h.id}>{h.name}</option>
                   ))}
                 </select>
               )}
             </div>
           </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
           <button 
             onClick={() => setIsMaximized(!isMaximized)} 
             className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border ${isMaximized ? 'bg-slate-800 text-white border-transparent' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
             title={isMaximized ? 'Standard View' : 'Focus Mode'}
           >
             <i className={`fa-solid ${isMaximized ? 'fa-compress' : 'fa-expand'}`}></i>
             <span className="hidden sm:inline">{isMaximized ? 'Exit Focus' : 'Focus'}</span>
           </button>
           <button 
             data-guide="studio-save"
             onClick={saveToHistory} 
             className="bg-emerald-700 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-800 transition-all active:scale-95 flex items-center gap-2"
           >
             <i className="fa-solid fa-cloud-arrow-up sm:hidden"></i>
             <span className="hidden sm:inline">Save Changes</span>
             <span className="sm:hidden">Save</span>
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Studio Sidebar */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
           {/* Directives Panel */}
           <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Directives</h4>
                 <select 
                   data-guide="studio-model"
                   value={model} 
                   onChange={(e) => { setModel(e.target.value as ArtModelType); onAdvanceGuide?.(2); }}
                   className="bg-transparent border-none text-[9px] font-black uppercase text-slate-400 hover:text-slate-800 outline-none cursor-pointer"
                 >
                   <option key="model-pro" value="gemini-3.1-flash-image-preview">Model: Pro</option>
                   <option key="model-flash" value="gemini-2.5-flash-image">Model: Flash</option>
                 </select>
              </div>
              
              <textarea 
                data-guide="studio-prompt"
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); onAdvanceGuide?.(4); }}
                placeholder="Plot directives for this episode..."
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[11px] font-medium leading-relaxed resize-none h-32 outline-none focus:ring-2 focus:ring-slate-100 transition-all shadow-sm"
              />

              <div className="flex flex-col gap-2">
                <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Panel Count (1-6)</label>
                <div data-guide="studio-panels" className="flex bg-white border border-slate-200 rounded-lg p-1">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button 
                      key={n}
                      onClick={() => { setPanelCount(n); onAdvanceGuide?.(3); }}
                      className={`flex-1 h-7 rounded flex items-center justify-center text-[10px] font-black transition-all ${panelCount === n ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => handleGenerateFullComic(true)} 
                    disabled={isProcessing}
                    className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200 shadow-sm disabled:opacity-30"
                    title="Randomized Plot"
                  >
                    <i className="fa-solid fa-dice"></i>
                  </button>
                  <button 
                    data-guide="studio-render"
                    onClick={() => handleGenerateFullComic(false)} 
                    disabled={isProcessing}
                    className="h-10 px-4 bg-slate-800 text-white rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md disabled:opacity-30 flex-1"
                  >
                    {isProcessing ? 'Rendering...' : 'Commit Render'}
                  </button>
                </div>
              </div>
           </div>

           {/* Tabs for Sidebar content */}
           <div className="flex border-b border-slate-100 shrink-0 items-center pr-4">
              <button onClick={() => setActiveTab('finished')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab !== 'history' ? 'bg-slate-50 text-slate-800 border-b-2 border-slate-800' : 'text-slate-400'}`}>Current Script</button>
              <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'history' ? 'bg-slate-50 text-slate-800 border-b-2 border-slate-800' : 'text-slate-400'}`}>History</button>
              {activeTab !== 'history' && script && (
                <button 
                  onClick={handleCopyPrompt}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-800 transition-all flex items-center justify-center ml-2"
                  title="Copy Full AI Prompt"
                >
                  <i className="fa-solid fa-copy text-[10px]"></i>
                </button>
              )}
           </div>
           
           <div className="p-4 space-y-4">
              {activeTab === 'history' ? (
                filteredHistory.length > 0 ? (
                  filteredHistory.map(s => (
                    <div key={s.id} onClick={() => loadStrip(s)} className="p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-800 transition-all group shadow-sm relative">
                       <button 
                         onClick={(e) => { e.stopPropagation(); if(window.confirm('Remove from vault?')) onDeleteHistoryItem(s.id); }}
                         className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg hover:scale-110"
                         title="Delete from Vault"
                       >
                         <i className="fa-solid fa-trash-can text-[10px]"></i>
                       </button>
                       <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                          <CachedImage src={s.finishedImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                       </div>
                       <div className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-800 truncate px-1">{s.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center px-6">
                    <i className="fa-solid fa-clock-rotate-left text-4xl text-slate-200 mb-4"></i>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No history found for this series.</p>
                  </div>
                )
              ) : script?.map(p => (
                 <div key={p.panelNumber} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Panel {p.panelNumber}</div>
                    <p className="text-[11px] text-slate-600 italic mb-2 leading-relaxed">"{p.visualDescription}"</p>
                    {p.dialogue?.map((d, i) => (
                       <div key={i} className="text-[11px] font-bold text-slate-800 mb-1 flex items-start gap-1">
                         <span className="bg-slate-200 text-slate-500 text-[8px] px-1 rounded shrink-0 mt-0.5">{d.id}</span>
                         <div>
                           <span className="uppercase text-[9px] text-slate-400 mr-1 font-black">{d.character}:</span> "{d.text}"
                         </div>
                       </div>
                    ))}
                 </div>
              ))}
           </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 bg-slate-100 flex flex-col relative overflow-hidden">
           {/* Tab bar for the central workspace */}
           <div className="bg-white/90 backdrop-blur-md px-6 py-2 border-b border-slate-200 flex gap-6 items-center shrink-0 z-10">
              <button onClick={() => setActiveTab('finished')} className={`text-[10px] font-black uppercase tracking-widest py-3 border-b-2 transition-all ${activeTab === 'finished' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Visual Production</button>
              {imageHistory.length > 1 && activeTab === 'finished' && (
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-[8px] font-black uppercase text-slate-400">Versions:</span>
                  <div className="flex gap-1">
                    {imageHistory.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFinishedImage(img)}
                        className={`w-6 h-6 rounded-md border-2 transition-all overflow-hidden ${finishedImage === img ? 'border-slate-800 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      >
                        <CachedImage src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setActiveTab('export')} disabled={!finishedImage} className={`text-[10px] font-black uppercase tracking-widest py-3 border-b-2 transition-all ${activeTab === 'export' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'} disabled:opacity-20`}>Dialog Overlay (AR Layer)</button>
              <div className="flex-1"></div>
              {activeTab === 'finished' && finishedImage && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsManualCleaning(!isManualCleaning)}
                    className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${isManualCleaning ? 'bg-slate-800 text-white border-transparent shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <i className="fa-solid fa-hand-dots"></i>
                    Manual Cleaning
                  </button>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <input 
                      type="checkbox" 
                      id="removeSpeechBubbles"
                      checked={removeSpeechBubbles}
                      onChange={(e) => setRemoveSpeechBubbles(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <label htmlFor="removeSpeechBubbles" className="text-[9px] font-black uppercase text-slate-500 cursor-pointer">Remove Bubbles</label>
                  </div>
                  <button 
                    data-guide="studio-clean"
                    onClick={handleGenerateExport} 
                    disabled={isProcessing} 
                    className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <i className="fa-solid fa-sparkles"></i>
                    {isManualCleaning ? 'Prepare Clean Asset (Manual)' : 'Prepare Clean Asset'}
                  </button>
                </div>
              )}
           </div>

            {/* Manual Cleaning Tools - Docked at Bottom */}
            {activeTab === 'finished' && isManualCleaning && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 items-center bg-slate-800 text-white p-2 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 z-50">
                <div className="flex gap-2 px-2">
                  <button 
                    onClick={() => setCleaningTool('brush')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${cleaningTool === 'brush' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400 hover:bg-white/10'}`}
                    title="Brush Tool"
                  >
                    <i className="fa-solid fa-paintbrush"></i>
                  </button>
                  <button 
                    onClick={() => setCleaningTool('eraser')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${cleaningTool === 'eraser' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400 hover:bg-white/10'}`}
                    title="Eraser Tool"
                  >
                    <i className="fa-solid fa-eraser"></i>
                  </button>
                  <button 
                    onClick={() => setCleaningTool('polygon')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${cleaningTool === 'polygon' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400 hover:bg-white/10'}`}
                    title="Polygon Tool (Enter to finish)"
                  >
                    <i className="fa-solid fa-draw-polygon"></i>
                  </button>
                  <button 
                    onClick={() => setCleaningTool('eyedropper')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${cleaningTool === 'eyedropper' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400 hover:bg-white/10'}`}
                    title="Eyedropper Tool"
                  >
                    <i className="fa-solid fa-eye-dropper"></i>
                  </button>
                </div>
                
                <div className="w-[1px] h-6 bg-white/10"></div>

                <div className="flex items-center gap-2 px-2">
                  <input 
                    type="color" 
                    value={cleaningColor} 
                    onChange={(e) => setCleaningColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                    title="Cleaning Color"
                  />
                </div>

                <div className="w-[1px] h-6 bg-white/10"></div>

                {(cleaningTool === 'brush' || cleaningTool === 'eraser') && (
                  <div className="flex items-center gap-3 px-2">
                    <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Size</label>
                    <input 
                      type="range" 
                      min="4" 
                      max="100" 
                      value={brushSize} 
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-32 accent-white"
                    />
                    <span className="text-[10px] font-black w-6 text-center">{brushSize}</span>
                  </div>
                )}

                {cleaningTool === 'polygon' && (
                  <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest px-2 flex flex-col items-center">
                    <span>{polygonPoints.length} points</span>
                    <span className="text-white/50">Enter to fill</span>
                  </div>
                )}

                <div className="w-[1px] h-6 bg-white/10"></div>

                <div className="flex gap-2 px-2">
                  <button 
                    onClick={undoCleaning}
                    disabled={cleaningHistory.length === 0}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                    title="Undo (Ctrl+Z)"
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                  </button>
                  <button 
                    onClick={() => {
                      if (manualCanvasRef.current) {
                        saveCleaningState();
                        const ctx = manualCanvasRef.current.getContext('2d');
                        ctx?.clearRect(0, 0, manualCanvasRef.current.width, manualCanvasRef.current.height);
                        setPolygonPoints([]);
                      }
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                    title="Clear All"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Floating Toolbar for Dialogue Overlay */}
            {activeTab === 'export' && exportImage && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50 animate-in slide-in-from-top-4">
                <div className="flex gap-2 items-center bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-2xl">
                  <button 
                    onClick={() => setToolMode('select')} 
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${toolMode === 'select' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Select & Move (S)"
                  >
                    <i className="fa-solid fa-arrow-pointer"></i>
                  </button>
                  <button 
                    onClick={() => setToolMode('pan')} 
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${toolMode === 'pan' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Pan Tool (H)"
                  >
                    <i className="fa-solid fa-hand"></i>
                  </button>
                  <button 
                    onClick={() => setToolMode('text')} 
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${toolMode === 'text' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Add New Textbox (T)"
                  >
                    <i className="fa-solid fa-font"></i>
                  </button>
                  <button 
                    onClick={() => setToolMode('eraser')} 
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${toolMode === 'eraser' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Eraser Tool (E)"
                  >
                    <i className="fa-solid fa-eraser"></i>
                  </button>
                  <div className="w-[1px] h-6 bg-slate-200 mx-2"></div>
                  <button 
                    onClick={() => { if(window.confirm('Delete all dialogue fields?')) setTextFields([]); }}
                    className="w-10 h-10 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all"
                    title="Clear All Fields"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                  <div className="w-[1px] h-6 bg-slate-200 mx-2"></div>
                  
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 px-2">
                    <button 
                      onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all"
                      title="Zoom Out"
                    >
                      <i className="fa-solid fa-magnifying-glass-minus"></i>
                    </button>
                    <button 
                      onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                      className="px-2 py-1 text-[9px] font-black uppercase text-slate-400 hover:text-slate-800 transition-all"
                      title="Reset Zoom"
                    >
                      {Math.round(zoom * 100)}%
                    </button>
                    <button 
                      onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all"
                      title="Zoom In"
                    >
                      <i className="fa-solid fa-magnifying-glass-plus"></i>
                    </button>
                  </div>
                  <div className="w-[1px] h-6 bg-slate-200 mx-2"></div>
                  <button onClick={handleExportManifest} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all">Manifest</button>
                  <button onClick={handleFlattenExport} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl shadow-lg transition-all ml-1">Export PNG</button>
                </div>
              </div>
            )}

            {/* Property Bar for Selected Field - Moved to Bottom */}
            {activeTab === 'export' && selectedField && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 items-center bg-slate-800 text-white p-2 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 z-50">
                <div className="flex items-center gap-3 px-2">
                  {(() => {
                    const char = activeComic.characters?.find(c => c.name === selectedField.characterName);
                    const avatar = char?.avatarUrl || char?.imageUrl;
                    return avatar ? (
                      <CachedImage src={avatar} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-slate-400">?</div>
                    );
                  })()}
                  <div className="flex flex-col">
                      <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-1">Character</label>
                      <select 
                        value={selectedField.characterName}
                        onChange={(e) => updateField(selectedField.id, { characterName: e.target.value })}
                        className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer"
                      >
                        <option key="char-unknown" value="Unknown" className="text-slate-800">Unknown</option>
                        {activeComic.characters?.map(c => <option key={c.id} value={c.name} className="text-slate-800">{c.name}</option>)}
                      </select>
                  </div>
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex flex-col px-2">
                    <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-1">Font</label>
                    <select 
                      value={selectedField.font}
                      onChange={(e) => updateField(selectedField.id, { font: e.target.value })}
                      className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer"
                      style={{ fontFamily: getFontFamily(selectedField.font) }}
                    >
                      {(activeComic.selectedFonts || ['Amatic SC', 'Annie Use Your Telescope', 'Inter']).map(fontName => {
                        return (
                          <option key={fontName} value={fontName} className="text-slate-800" style={{ fontFamily: getFontFamily(fontName) }}>
                            {fontName}
                          </option>
                        );
                      })}
                    </select>
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex items-center gap-2 px-2">
                    <button 
                      onClick={() => updateField(selectedField.id, { fontSize: Math.max(8, selectedField.fontSize - 2) })}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px]"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <span className="text-[10px] font-black w-6 text-center">{selectedField.fontSize}</span>
                    <button 
                      onClick={() => updateField(selectedField.id, { fontSize: Math.min(120, selectedField.fontSize + 2) })}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px]"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex gap-1 px-2">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button 
                        key={align}
                        onClick={() => updateField(selectedField.id, { alignment: align })}
                        className={`w-7 h-7 rounded flex items-center justify-center text-[10px] transition-all ${selectedField.alignment === align ? 'bg-white text-slate-800' : 'hover:bg-white/10'}`}
                      >
                        <i className={`fa-solid fa-align-${align}`}></i>
                      </button>
                    ))}
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex flex-col px-2">
                    <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-1">Rounding</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedField.rounding || 0} 
                        onChange={(e) => updateField(selectedField.id, { rounding: parseInt(e.target.value) })}
                        className="w-16 accent-emerald-500"
                      />
                      <span className="text-[10px] font-black w-6 text-center">{selectedField.rounding || 0}</span>
                    </div>
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex flex-col px-2">
                    <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-1">Order</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={selectedField.order || 1} 
                      onChange={(e) => updateField(selectedField.id, { order: parseInt(e.target.value) || 1 })}
                      className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer w-12 border-b border-white/20 focus:border-emerald-500"
                    />
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex flex-col px-2">
                    <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-1">Script Link</label>
                    <select 
                      value={selectedField.dialogueId || ''}
                      onChange={(e) => updateField(selectedField.id, { dialogueId: e.target.value })}
                      className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer max-w-[80px]"
                    >
                      <option key="diag-none" value="" className="text-slate-800">None</option>
                      {script?.flatMap(p => p.dialogue).map(d => (
                        <option key={d.id} value={d.id} className="text-slate-800">{d.id} ({d.character})</option>
                      ))}
                    </select>
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <button 
                  onClick={deleteSelectedField}
                  className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center ml-1"
                  title="Delete Field"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            )}

            {/* Floating Zoom Controls - Always Visible in Workspace */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
              <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center">
                <button 
                  onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all"
                  title="Zoom In"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
                <div className="h-[1px] w-6 bg-slate-100 my-1"></div>
                <button 
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-all text-[10px] font-black"
                  title="Reset Zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <div className="h-[1px] w-6 bg-slate-100 my-1"></div>
                <button 
                  onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all"
                  title="Zoom Out"
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
              </div>
              
              <button 
                onClick={() => setToolMode(toolMode === 'pan' ? 'select' : 'pan')}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${toolMode === 'pan' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                title="Pan Tool (H)"
              >
                <i className="fa-solid fa-hand"></i>
              </button>
            </div>

           {/* EXTENDED SCROLL AREA */}
           <div className="flex-1 overflow-auto relative scroll-smooth bg-slate-50/50">
              <div className="min-h-[250%] w-full flex flex-col items-center pt-12">
                <div 
                  ref={containerRef}
                  className={`relative bg-white shadow-[0_40px_120px_rgba(0,0,0,0.2)] select-none transition-all ${activeTab === 'export' ? (toolMode === 'text' ? 'cursor-crosshair' : toolMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default') : 'cursor-zoom-in'}`}
                  style={{ 
                    width: '90%', 
                    maxWidth: isMaximized ? '1400px' : '1000px',
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'center top'
                  }}
                  onMouseDown={handleContainerMouseDown}
                  onMouseMove={handleContainerMouseMove}
                  onMouseUp={handleContainerMouseUp}
                  onWheel={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      const delta = e.deltaY > 0 ? -0.1 : 0.1;
                      setZoom(prev => Math.max(0.2, Math.min(5, prev + delta)));
                    }
                  }}
                  onClick={() => { if(activeTab === 'finished' && finishedImage && !isManualCleaning) onPreviewImage(finishedImage); }}
                >
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/95 z-[500] flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
                       <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mb-6"></div>
                       <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-800 animate-pulse">{statusMessage}</p>
                    </div>
                  )}

                  {error && !isProcessing && (
                    <div className="absolute inset-0 bg-rose-50/95 z-[500] flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
                       <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                          <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                       </div>
                       <h3 className="text-xl font-black uppercase tracking-widest text-rose-900 mb-2">Production Interrupted</h3>
                       <p className="text-sm text-rose-700 mb-8 max-w-md leading-relaxed font-medium italic">"{error}"</p>
                       <button 
                         onClick={() => { setError(null); handleGenerateFullComic(false); }}
                         className="px-10 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-rose-700 transition-all"
                       >
                         Retry Production
                       </button>
                    </div>
                  )}

                  {(finishedImage || exportImage) ? (
                    <div className="relative w-full h-auto block">
                      <CachedImage 
                        src={activeTab === 'export' ? (exportImage || finishedImage)! : finishedImage!} 
                        className="w-full h-auto block pointer-events-none rounded-sm" 
                        alt="Workspace Art"
                      />
                    </div>
                  ) : (
                    <div style={{ aspectRatio: '16/9' }}></div>
                  )}

                  {/* Panel Layout Overlay */}
                  {activeTab === 'finished' && panelLayout.length > 0 && !isManualCleaning && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      {panelLayout.map(panel => (
                        <div
                          key={panel.panelNumber}
                          className="absolute border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center"
                          style={{ left: `${panel.x}%`, top: `${panel.y}%`, width: `${panel.width}%`, height: `${panel.height}%` }}
                        >
                          <span className="text-[8px] font-black text-emerald-600/50 uppercase tracking-tighter">Panel {panel.panelNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual Cleaning Overlay */}
                  {activeTab === 'finished' && isManualCleaning && (
                    <div className={`absolute inset-0 z-40 pointer-events-auto ${(cleaningTool === 'brush' || cleaningTool === 'eraser') ? 'cursor-none' : cleaningTool === 'eyedropper' ? 'cursor-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0yIDIyIDEuNS0xLjUiLz48cGF0aCBkPSJtMi41IDIuNSAyMCAyMCIvPjxwYXRoIGQ9Im0yMS41IDIuNS0yIDIuNSIvPjxwYXRoIGQ9Ik0yMS41IDIuNSAyMCA0LjUiLz48cGF0aCBkPSJtMjEuNSAyLjUtMiAyLjUiLz48cGF0aCBkPSJtMjEuNSAyLjUtMiAyLjUiLz48cGF0aCBkPSJtMjEuNSAyLjUtMiAyLjUiLz48cGF0aCBkPSJtMjEuNSAyLjUtMiAyLjUiLz48cGF0aCBkPSJtMjEuNSAyLjUtMiAyLjUiLz48cGF0aCBkPSJtMjEuNSAyLjUtMiAyLjUiLz48L3N2Zz4=)_0_24,crosshair]' : 'cursor-crosshair'}`}>
                      <canvas 
                        ref={manualCanvasRef}
                        className="w-full h-full pointer-events-none"
                      />
                      {/* Custom Brush Cursor */}
                      {(cleaningTool === 'brush' || cleaningTool === 'eraser') && (
                        <div 
                          className="absolute pointer-events-none border border-white/50 bg-white/20 rounded-full z-[1000] mix-blend-difference"
                          style={{
                            left: `${mousePos.x}%`,
                            top: `${mousePos.y}%`,
                            width: `${brushSize / 5}%`,
                            aspectRatio: '1 / 1',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      )}
                      {/* Polygon Preview */}
                      {cleaningTool === 'polygon' && polygonPoints.length > 0 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <polyline
                            points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="white"
                            strokeWidth="0.5"
                            strokeDasharray="1"
                          />
                          {polygonPoints.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="0.5" fill="white" />
                          ))}
                        </svg>
                      )}
                    </div>
                  )}

                  {activeTab === 'export' && (
                    <div className="absolute inset-0 z-10" onClick={(e) => e.stopPropagation()}>
                      {textFields?.map(field => (
                        <div
                          key={field.id}
                          className={`absolute border-2 transition-shadow ${selectedFieldId === field.id ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white/5 shadow-2xl z-30' : 'border-dashed border-slate-300 hover:border-slate-500 z-20'}`}
                          style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}
                        >
                          <div 
                            className="absolute inset-0 cursor-move"
                            onMouseDown={(e) => handleFieldInteractionStart(e, field, 'moving')}
                          ></div>
                          
                          <div 
                            className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] z-10 pointer-events-auto"
                          >
                            <EditableBubble
                              text={field.text}
                              alignment={field.alignment}
                              font={field.font}
                              fontSize={field.fontSize}
                              rounding={field.rounding}
                              onChange={(newText) => updateField(field.id, { text: newText })}
                              onFocus={() => setSelectedFieldId(field.id)}
                            />
                          </div>

                          {selectedFieldId === field.id && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-50 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-20 cursor-move border-2 border-white">
                               <i className="fa-solid fa-up-down-left-right text-[8px]"></i>
                            </div>
                          )}

                          {selectedFieldId === field.id && (
                            <div 
                              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-emerald-500 cursor-ns-resize flex items-center justify-center text-white text-[10px] z-30 shadow-lg border-2 border-white rounded-full transition-transform hover:scale-110 active:scale-90"
                              onMouseDown={(e) => handleFieldInteractionStart(e, field, 'resizing')}
                            >
                              <i className="fa-solid fa-arrows-up-down text-[8px]"></i>
                            </div>
                          )}
                          
                          <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm z-20 pointer-events-none uppercase tracking-widest">
                            {field.characterName || 'Unknown'}
                          </div>
                          {field.order && (
                            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-20 pointer-events-none border-2 border-white">
                              {field.order}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!finishedImage && !isProcessing && (
                    <div 
                      className={`absolute inset-0 flex flex-col items-center justify-center p-10 text-center transition-all ${isDragging ? 'bg-emerald-500/10 scale-95' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          handleUploadImage(file);
                        }
                      }}
                    >
                      <i className={`fa-solid fa-palette text-[140px] mb-10 transition-all ${isDragging ? 'text-emerald-500 opacity-40 scale-110' : 'opacity-5'}`}></i>
                      <p className="text-2xl font-black uppercase tracking-[0.5em] opacity-20 mb-8">Studio Ready</p>
                      
                      <div className="flex flex-col gap-4 pointer-events-auto">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleGenerateFullComic(false); }} 
                          className="px-14 py-4 bg-slate-800 text-white rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 transition-all font-black uppercase tracking-widest text-xs border border-slate-700"
                        >
                          Begin Production
                        </button>
                        
                        <div className="flex items-center gap-4">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <label className="px-10 py-3 bg-white text-slate-600 rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-all font-black uppercase tracking-widest text-[10px] cursor-pointer flex items-center justify-center gap-2">
                          <i className="fa-solid fa-upload"></i>
                          Upload Existing Comic
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadImage(file);
                            }}
                          />
                        </label>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Drag and drop image here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {showCharacterRef && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-header uppercase tracking-tight text-slate-800">Character Reference</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Production DNA for {activeComic.name}</p>
              </div>
              <button 
                onClick={() => setShowCharacterRef(false)}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeComic.characters?.length ? (
                activeComic.characters.map(char => (
                  <div key={char.id} className="flex gap-6 items-start bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-white">
                      {char.avatarUrl ? (
                        <CachedImage src={char.avatarUrl} className="w-full h-full object-cover" />
                      ) : char.imageUrl ? (
                        <CachedImage src={char.imageUrl} className="w-full h-full object-cover opacity-50" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-2xl">👤</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-800 mb-1">{char.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed italic">{char.description || 'No DNA description provided.'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No characters defined for this series.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
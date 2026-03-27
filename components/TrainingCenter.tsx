import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { ComicProfile, Character, Environment, ArtModelType } from '../types';
import { generateEnvironmentDescription, generateCharacterImage, generateCharacterSheet, generateExpressionSheet, getGeminiApiKey } from '../services/gemini';
import { downscaleImage } from '../utils/imageUtils';
import { downloadImage } from '../services/utils';
import { imageStore } from '../services/imageStore';
import { AvatarCropper } from './AvatarCropper';
import { CachedImage } from './CachedImage';
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { COMIC_FONTS } from '../constants';

interface TrainingCenterProps {
  editingComic: ComicProfile;
  onUpdateComic: (updated: ComicProfile) => void;
  onPreviewImage: (url: string) => void;
  globalColor: string;
  onUpdateGlobalColor: (color: string) => void;
  contrastColor: string;
  onAdvanceGuide?: (step: number) => void;
}

const VaultVideo: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (src.startsWith('vault:')) {
      imageStore.getImage(src).then(url => setResolvedUrl(url));
    } else {
      setResolvedUrl(src);
    }
  }, [src]);

  if (!resolvedUrl) return <div className={className} />;

  return (
    <video 
      ref={videoRef}
      src={resolvedUrl}
      autoPlay 
      loop 
      muted 
      playsInline 
      className={className}
    />
  );
};

export const TrainingCenter: React.FC<TrainingCenterProps> = ({ 
  editingComic, onUpdateComic, onPreviewImage, globalColor, onUpdateGlobalColor, contrastColor, onAdvanceGuide
}) => {
  const [localComic, setLocalComic] = useState<ComicProfile>(() => {
    const comic = JSON.parse(JSON.stringify(editingComic));
    // Populate styleDescription with artStyle if empty
    if (!comic.styleDescription && comic.artStyle && !['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview'].includes(comic.artStyle)) {
      comic.styleDescription = comic.artStyle;
    }
    return comic;
  });
  const [isGeneratingEnv, setIsGeneratingEnv] = useState<string | null>(null);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [croppingCharacterId, setCroppingCharacterId] = useState<string | null>(null);
  const [cropperImageUrl, setCropperImageUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(editingComic.name);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (croppingCharacterId) {
      const char = localComic.characters.find(c => c.id === croppingCharacterId);
      if (char?.imageUrl) {
        imageStore.getImage(char.imageUrl).then(url => {
          if (url) setCropperImageUrl(url);
        });
      }
    }
  }, [croppingCharacterId, localComic.characters]);

  useEffect(() => {
    const comic = JSON.parse(JSON.stringify(editingComic));
    if (!comic.styleDescription && comic.artStyle && !['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview'].includes(comic.artStyle)) {
      comic.styleDescription = comic.artStyle;
    }
    setLocalComic(comic);
  }, [editingComic.id]);

  const handleSaveProtocol = (updatedState: ComicProfile) => {
    setLocalComic(updatedState);
    onUpdateComic(updatedState);
  };

  const handleExportGenomeZip = async () => {
    setIsProcessingZip(true);
    try {
      const zip = new JSZip();
      
      const exportData: any = {
        profile: JSON.parse(JSON.stringify(localComic))
      };

      const processImage = async (url: string | undefined, prefix: string): Promise<string | undefined> => {
        if (!url) return undefined;
        const safeUrl = await imageStore.getSafeUrl(url);
        if (!safeUrl) return undefined;
        
        try {
          const response = await fetch(safeUrl);
          const blob = await response.blob();
          const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`;
          zip.file(fileName, blob);
          if (safeUrl.startsWith('blob:')) URL.revokeObjectURL(safeUrl);
          return fileName;
        } catch (e) {
          console.error("Failed to process image:", url, e);
          return undefined;
        }
      };

      const processVideo = async (url: string | undefined, prefix: string): Promise<string | undefined> => {
        if (!url) return undefined;
        const safeUrl = await imageStore.getSafeUrl(url);
        if (!safeUrl) return undefined;
        
        try {
          const response = await fetch(safeUrl);
          const blob = await response.blob();
          const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.mp4`;
          zip.file(fileName, blob);
          if (safeUrl.startsWith('blob:')) URL.revokeObjectURL(safeUrl);
          return fileName;
        } catch (e) {
          console.error("Failed to process video:", url, e);
          return undefined;
        }
      };

      if (exportData.profile) {
        const p = exportData.profile;
        if (p.styleReferenceImageUrl) {
          p.styleReferenceImageUrl = await processImage(p.styleReferenceImageUrl, 'style_ref') || p.styleReferenceImageUrl;
        }
        if (p.styleReferenceImageUrls) {
          p.styleReferenceImageUrls = await Promise.all(p.styleReferenceImageUrls.map((url: string, i: number) => processImage(url, `style_ref_${i}`)));
          p.styleReferenceImageUrls = p.styleReferenceImageUrls.filter(Boolean);
        }
        if (p.characters) {
          for (let i = 0; i < p.characters.length; i++) {
            const c = p.characters[i];
            if (c.imageUrl) c.imageUrl = await processImage(c.imageUrl, `char_${i}_img`) || c.imageUrl;
            if (c.avatarUrl) c.avatarUrl = await processImage(c.avatarUrl, `char_${i}_avatar`) || c.avatarUrl;
            if (c.characterSheetUrl) c.characterSheetUrl = await processImage(c.characterSheetUrl, `char_${i}_sheet`) || c.characterSheetUrl;
            if (c.expressionSheetUrl) c.expressionSheetUrl = await processImage(c.expressionSheetUrl, `char_${i}_expr`) || c.expressionSheetUrl;
          }
        }
        if (p.environments) {
          for (let i = 0; i < p.environments.length; i++) {
            const e = p.environments[i];
            if (e.imageUrl) e.imageUrl = await processImage(e.imageUrl, `env_${i}_img`) || e.imageUrl;
          }
        }
        if (p.libraryVideoUrl) {
          p.libraryVideoUrl = await processVideo(p.libraryVideoUrl, 'library_video') || p.libraryVideoUrl;
        }
      }

      zip.file("genome_data.json", JSON.stringify(exportData, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${localComic.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_genome.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export genome.");
    } finally {
      setIsProcessingZip(false);
    }
  };

  const handleImportGenomeZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingZip(true);
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      
      const dataFile = loadedZip.file("genome_data.json");
      if (!dataFile) {
        alert("Invalid zip file: missing genome_data.json");
        setIsProcessingZip(false);
        return;
      }

      const dataString = await dataFile.async("string");
      const genomeData = JSON.parse(dataString);

      if (!genomeData.profile) {
        alert("Invalid zip file: missing profile data");
        setIsProcessingZip(false);
        return;
      }

      const processImportImage = async (fileName: string | undefined): Promise<string | undefined> => {
        if (!fileName) return undefined;
        const file = loadedZip.file(fileName);
        if (!file) return fileName; // Return original if not found in zip (might be an external URL)
        try {
          const blob = await file.async('blob');
          const reader = new FileReader();
          return new Promise<string>((resolve, reject) => {
            reader.onloadend = async () => {
              const dataUrl = reader.result as string;
              const key = await imageStore.storeImage(dataUrl);
              resolve(`vault:${key}`);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error("Failed to import image:", fileName, e);
          return fileName;
        }
      };

      const processImportVideo = async (fileName: string | undefined): Promise<string | undefined> => {
        if (!fileName) return undefined;
        const file = loadedZip.file(fileName);
        if (!file) return fileName;
        try {
          const blob = await file.async('blob');
          const reader = new FileReader();
          return new Promise<string>((resolve, reject) => {
            reader.onloadend = async () => {
              const dataUrl = reader.result as string;
              const key = await imageStore.storeImage(dataUrl);
              resolve(`vault:${key}`);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error("Failed to import video:", fileName, e);
          return fileName;
        }
      };

      const p = genomeData.profile;
      
      if (p.styleReferenceImageUrl) {
        p.styleReferenceImageUrl = await processImportImage(p.styleReferenceImageUrl);
      }
      if (p.styleReferenceImageUrls) {
        p.styleReferenceImageUrls = await Promise.all(p.styleReferenceImageUrls.map((url: string) => processImportImage(url)));
        p.styleReferenceImageUrls = p.styleReferenceImageUrls.filter(Boolean);
      }
      if (p.characters) {
        for (let i = 0; i < p.characters.length; i++) {
          const c = p.characters[i];
          if (c.imageUrl) c.imageUrl = await processImportImage(c.imageUrl);
          if (c.avatarUrl) c.avatarUrl = await processImportImage(c.avatarUrl);
          if (c.characterSheetUrl) c.characterSheetUrl = await processImportImage(c.characterSheetUrl);
          if (c.expressionSheetUrl) c.expressionSheetUrl = await processImportImage(c.expressionSheetUrl);
        }
      }
      if (p.environments) {
        for (let i = 0; i < p.environments.length; i++) {
          const e = p.environments[i];
          if (e.imageUrl) e.imageUrl = await processImportImage(e.imageUrl);
        }
      }
      if (p.libraryVideoUrl) {
        p.libraryVideoUrl = await processImportVideo(p.libraryVideoUrl);
      }

      // Merge imported profile with current profile, keeping the current ID
      const mergedProfile = {
        ...p,
        id: localComic.id, // Keep the current ID so it updates the existing comic
      };

      handleSaveProtocol(mergedProfile);
      alert("Genome imported successfully!");
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import genome.");
    } finally {
      setIsProcessingZip(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setIsDragging(id);
  };

  const handleDragLeave = () => {
    setIsDragging(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'char' | 'env' | 'style', id: string | null) => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(type, id, file);
    }
  };

  const handleColorChange = (color: string) => {
    const updated = { ...localComic, backgroundColor: color };
    setLocalComic(updated);
    onUpdateComic(updated);
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    const updated = {
      ...localComic,
      characters: (localComic.characters || []).map(c => c.id === id ? { ...c, ...updates } : c)
    };
    handleSaveProtocol(updated);
  };

  const handleGenerateCharacterAsset = async (charId: string, type: 'main' | 'sheet' | 'expression') => {
    const char = localComic.characters.find(c => c.id === charId);
    if (!char) return;

    setIsGeneratingAsset(`${charId}_${type}`);
    try {
      let url = '';
      const model: ArtModelType = 'gemini-3.1-flash-image-preview';
      
      if (type === 'main') {
        url = await generateCharacterImage(localComic, char.name, char.description, model);
      } else if (type === 'sheet') {
        if (!char.imageUrl) throw new Error("Need a main character image first.");
        const resolvedImageUrl = await imageStore.getImage(char.imageUrl);
        if (!resolvedImageUrl) throw new Error("Could not resolve character image from vault.");
        url = await generateCharacterSheet(localComic, char.name, resolvedImageUrl, model);
      } else if (type === 'expression') {
        if (!char.imageUrl) throw new Error("Need a main character image first.");
        const resolvedImageUrl = await imageStore.getImage(char.imageUrl);
        if (!resolvedImageUrl) throw new Error("Could not resolve character image from vault.");
        url = await generateExpressionSheet(localComic, char.name, resolvedImageUrl, model);
      }

      const downscaled = await downscaleImage(url, 1024);
      const vaulted = await imageStore.vaultify(downscaled);
      
      if (type === 'main') updateCharacter(charId, { imageUrl: vaulted, avatarUrl: vaulted });
      else if (type === 'sheet') updateCharacter(charId, { characterSheetUrl: vaulted });
      else if (type === 'expression') updateCharacter(charId, { expressionSheetUrl: vaulted });

    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGeneratingAsset(null);
    }
  };

  const addCharacter = () => {
    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: 'New Subject',
      description: 'Physical traits and behavior...'
    };
    const updated = {
      ...localComic,
      characters: [...(localComic.characters || []), newChar]
    };
    handleSaveProtocol(updated);
    onAdvanceGuide?.(15);
  };

  const addEnvironment = () => {
    const newEnv: Environment = {
      id: `env_${Date.now()}`,
      name: 'New Locale',
      description: 'Visual atmosphere...'
    };
    const updated = {
      ...localComic,
      environments: [...(localComic.environments || []), newEnv]
    };
    handleSaveProtocol(updated);
  };

  const handleGenerateLibraryVideo = async () => {
    if (isGeneratingVideo) return;

    try {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // After openSelectKey, we should assume the key is selected or will be available
        }
      }

      setIsGeneratingVideo(true);

      // Gather reference images (up to 3)
      const refImages: string[] = [];
      
      // 1. Style references
      if (localComic.styleReferenceImageUrls?.length) {
        refImages.push(...localComic.styleReferenceImageUrls.slice(0, 3));
      }
      
      // 2. Characters if we need more
      if (refImages.length < 3 && localComic.characters?.length) {
        for (const char of localComic.characters) {
          if (char.imageUrl && !refImages.includes(char.imageUrl)) {
            refImages.push(char.imageUrl);
            if (refImages.length === 3) break;
          }
        }
      }

      // 3. Environments if we still need more
      if (refImages.length < 3 && localComic.environments?.length) {
        for (const env of localComic.environments) {
          if (env.imageUrl && !refImages.includes(env.imageUrl)) {
            refImages.push(env.imageUrl);
            if (refImages.length === 3) break;
          }
        }
      }

      const apiKey = getGeminiApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const referenceImagesPayload: any[] = [];
      for (const imgUrl of refImages) {
        const resolved = await imageStore.getImage(imgUrl);
        if (resolved) {
          const base64 = resolved.split(',')[1];
          const mimeType = resolved.split(';')[0].split(':')[1];
          referenceImagesPayload.push({
            image: {
              imageBytes: base64,
              mimeType: mimeType,
            },
            referenceType: VideoGenerationReferenceType.ASSET,
          });
        }
      }

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: `A cinematic, looping video showcasing the world of ${localComic.name}. ${localComic.styleDescription || ''}. High quality, consistent with reference assets.`,
        config: {
          numberOfVideos: 1,
          referenceImages: referenceImagesPayload,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const apiKey = getGeminiApiKey();
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey,
          },
        });
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const vaultedUrl = await imageStore.vaultify(base64data);
          const updated = { ...localComic, libraryVideoUrl: vaultedUrl };
          setLocalComic(updated);
          onUpdateComic(updated);
        };
        reader.readAsDataURL(blob);
      }

    } catch (e: any) {
      console.error("Video generation failed:", e);
      if (e.message?.includes("Requested entity was not found")) {
        alert("API Key issue. Please re-select your API key.");
        await window.aistudio?.openSelectKey();
      } else {
        alert("Failed to generate video: " + e.message);
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const removeEnvironment = (id: string) => {
    const updated = {
      ...localComic,
      environments: (localComic.environments || []).filter(e => e.id !== id)
    };
    handleSaveProtocol(updated);
  };

  const handleImageUpload = async (type: 'char' | 'env' | 'style', id: string | null, file: File) => {
    try {
      const vaultedUrl = await processAndVaultImage(file);
      let updated = { ...localComic };

      if (type === 'char') {
        updated.characters = (localComic.characters || []).map(c => c.id === id ? { ...c, imageUrl: vaultedUrl, avatarUrl: vaultedUrl } : c);
      } else if (type === 'env') {
        updated.environments = (localComic.environments || []).map(ev => ev.id === id ? { ...ev, imageUrl: vaultedUrl } : ev);
      } else if (type === 'style') {
        const currentUrls = localComic.styleReferenceImageUrls || (localComic.styleReferenceImageUrl ? [localComic.styleReferenceImageUrl] : []);
        if (currentUrls.length < 4) {
          const updatedUrls = [...currentUrls, vaultedUrl];
          updated.styleReferenceImageUrls = updatedUrls;
          updated.styleReferenceImageUrl = updatedUrls[0];
        }
      }
      handleSaveProtocol(updated);
    } catch (error: any) {
      console.error("Image processing failed:", error);
      alert(`The selected image could not be processed: ${error.message}`);
    }
  };

  const removeStyleImage = (index: number) => {
    const currentUrls = localComic.styleReferenceImageUrls || (localComic.styleReferenceImageUrl ? [localComic.styleReferenceImageUrl] : []);
    const updatedUrls = currentUrls.filter((_, i) => i !== index);
    const updated = {
      ...localComic,
      styleReferenceImageUrls: updatedUrls,
      styleReferenceImageUrl: updatedUrls[0] || undefined
    };
    handleSaveProtocol(updated);
  };

  const removeCharacter = (id: string) => {
    const updated = {
      ...localComic,
      characters: (localComic.characters || []).filter(c => c.id !== id)
    };
    handleSaveProtocol(updated);
  };

  const processAndVaultImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Invalid file type. Please select an image.'));
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const rawDataUrl = e.target?.result as string;
          const dataUrl = await downscaleImage(rawDataUrl, 600);
          const vaultedUrl = await imageStore.vaultify(dataUrl);
          resolve(vaultedUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleRename = () => {
    if (newName.trim()) {
      handleSaveProtocol({ ...localComic, name: newName.trim() });
      setIsRenaming(false);
    }
  };

  const charToEdit = editingCharacterId ? localComic.characters.find(c => c.id === editingCharacterId) : null;

  return (
    <div className="h-full relative">
      {editingCharacterId && charToEdit ? (
        <div className="h-full flex flex-col p-10 overflow-y-auto bg-white">
          {(() => {
            const char = charToEdit;
            return (
              <>
                <div className="flex justify-between items-center mb-12 border-b border-slate-100 pb-8">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setEditingCharacterId(null)}
                      className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
                    >
                      <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                      <h2 className="text-4xl font-header tracking-tight uppercase text-slate-800">Character Studio</h2>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Refining: {char.name}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                          {char.avatarUrl ? (
                            <CachedImage src={char.avatarUrl} className="w-full h-full object-cover" />
                          ) : char.imageUrl ? (
                            <CachedImage src={char.imageUrl} className="w-full h-full object-cover opacity-50" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-100 text-4xl">👤</div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Character Avatar</span>
                          {char.imageUrl && (
                            <button 
                              onClick={() => setCroppingCharacterId(char.id)}
                              className="text-[8px] font-black uppercase text-slate-800 bg-slate-200 px-4 py-1.5 rounded-full hover:bg-slate-300 transition-all flex items-center gap-2"
                            >
                              <i className="fa-solid fa-crop"></i>
                              Crop Avatar
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Identity</label>
                        <input 
                          type="text" 
                          value={char.name} 
                          onChange={e => updateCharacter(char.id, { name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Visual DNA / Description</label>
                        <textarea 
                          value={char.description} 
                          onChange={e => updateCharacter(char.id, { description: e.target.value })}
                          rows={6}
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-8 space-y-12 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Main Portrait */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Main Portrait</label>
                          <div className="flex gap-2">
                             <button 
                              onClick={() => handleGenerateCharacterAsset(char.id, 'main')}
                              disabled={!!isGeneratingAsset}
                              className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-all disabled:opacity-50"
                              title="Generate / Regenerate"
                            >
                              <i className={`fa-solid ${isGeneratingAsset === `${char.id}_main` ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'} text-[10px]`}></i>
                            </button>
                            <label className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer">
                              <i className="fa-solid fa-upload text-[10px]"></i>
                              <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload('char', char.id, e.target.files[0])} />
                            </label>
                            {char.imageUrl && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => updateCharacter(char.id, { imageUrl: undefined })}
                                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all"
                                >
                                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                                </button>
                                <button 
                                  onClick={() => downloadImage(char.imageUrl!, `${char.name}_portrait.png`)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"
                                >
                                  <i className="fa-solid fa-download text-[10px]"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div 
                          onDragOver={(e) => handleDragOver(e, 'char-studio-portrait')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'char', char.id)}
                          className={`aspect-square rounded-3xl border overflow-hidden relative group shadow-inner transition-all ${
                            isDragging === 'char-studio-portrait' ? 'border-brand-500 ring-4 ring-brand-100 bg-brand-50' : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          {char.imageUrl ? (
                            <>
                              <CachedImage src={char.imageUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(char.imageUrl!)} />
                              <button 
                                onClick={() => setCroppingCharacterId(char.id)}
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                              >
                                <i className="fa-solid fa-crop-simple mr-2"></i>
                                Crop Avatar
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                              <i className="fa-solid fa-user text-4xl mb-2"></i>
                              <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Render</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Character Sheet */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Orthographic Sheet</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleGenerateCharacterAsset(char.id, 'sheet')}
                              disabled={!!isGeneratingAsset || !char.imageUrl}
                              className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-all disabled:opacity-50"
                              title="Generate / Regenerate"
                            >
                              <i className={`fa-solid ${isGeneratingAsset === `${char.id}_sheet` ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'} text-[10px]`}></i>
                            </button>
                            <label className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer">
                              <i className="fa-solid fa-upload text-[10px]"></i>
                              <input type="file" className="hidden" onChange={e => {
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                  const url = await downscaleImage(ev.target?.result as string, 1024, 0.8);
                                  const vaultedUrl = await imageStore.vaultify(url);
                                  updateCharacter(char.id, { characterSheetUrl: vaultedUrl });
                                };
                                if(e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                              }} />
                            </label>
                            {char.characterSheetUrl && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => updateCharacter(char.id, { characterSheetUrl: undefined })}
                                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all"
                                >
                                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                                </button>
                                <button 
                                  onClick={() => downloadImage(char.characterSheetUrl!, `${char.name}_sheet.png`)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"
                                >
                                  <i className="fa-solid fa-download text-[10px]"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden relative group shadow-inner">
                          {char.characterSheetUrl ? (
                            <CachedImage src={char.characterSheetUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(char.characterSheetUrl!)} />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                              <i className="fa-solid fa-layer-group text-4xl mb-2"></i>
                              <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Render</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expression Sheet */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expression Sheet</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleGenerateCharacterAsset(char.id, 'expression')}
                              disabled={!!isGeneratingAsset || !char.imageUrl}
                              className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-all disabled:opacity-50"
                              title="Generate / Regenerate"
                            >
                              <i className={`fa-solid ${isGeneratingAsset === `${char.id}_expression` ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'} text-[10px]`}></i>
                            </button>
                            <label className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer">
                              <i className="fa-solid fa-upload text-[10px]"></i>
                              <input type="file" className="hidden" onChange={e => {
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                  const url = await downscaleImage(ev.target?.result as string, 1024, 0.8);
                                  const vaultedUrl = await imageStore.vaultify(url);
                                  updateCharacter(char.id, { expressionSheetUrl: vaultedUrl });
                                };
                                if(e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                              }} />
                            </label>
                            {char.expressionSheetUrl && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => updateCharacter(char.id, { expressionSheetUrl: undefined })}
                                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all"
                                >
                                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                                </button>
                                <button 
                                  onClick={() => downloadImage(char.expressionSheetUrl!, `${char.name}_expressions.png`)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"
                                >
                                  <i className="fa-solid fa-download text-[10px]"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden relative group shadow-inner">
                          {char.expressionSheetUrl ? (
                            <CachedImage src={char.expressionSheetUrl} className="w-full h-full object-cover cursor-zoom-in" onClick={() => onPreviewImage(char.expressionSheetUrl!)} />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                              <i className="fa-solid fa-face-smile text-4xl mb-2"></i>
                              <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Render</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="h-full flex flex-col p-10 overflow-y-auto">
          <div className="flex justify-between items-end mb-12 border-b border-black/5 pb-8">
            <div className="flex items-center gap-12">
              <div>
            <div className="flex items-center gap-4 mb-2">
               <h2 className={`text-5xl font-header tracking-tight uppercase ${contrastColor}`}>SERIES GENOME</h2>
            </div>
            <p className={`${contrastColor} opacity-70 font-medium text-lg italic flex items-center gap-3`}>
              <span>Calibrating visual logic for <span className="font-black underline">{localComic.name}</span>.</span>
              <button 
                onClick={() => { setNewName(localComic.name); setIsRenaming(true); }}
                className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-lg hover:bg-slate-200 transition-all"
              >
                Rename
              </button>
              <button 
                onClick={handleExportGenomeZip}
                disabled={isProcessingZip}
                className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-3 py-1 rounded-lg hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessingZip ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-download"></i>}
                Export
              </button>
              <label className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-lg hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-2">
                <i className="fa-solid fa-upload"></i>
                Import
                <input 
                  type="file" 
                  accept=".zip" 
                  className="hidden" 
                  onChange={handleImportGenomeZip} 
                  disabled={isProcessingZip}
                />
              </label>
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${contrastColor} opacity-50`}>Series Background</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={localComic.backgroundColor || '#ffffff'} 
                onChange={e => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded-xl border-none p-0 cursor-pointer bg-transparent"
              />
              <input 
                type="text" 
                value={localComic.backgroundColor || '#ffffff'} 
                onChange={e => handleColorChange(e.target.value)}
                className={`bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-xs font-mono ${contrastColor} outline-none w-24`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${contrastColor} opacity-50`}>Art Model</label>
            <select 
              value={localComic.artModel || 'gemini-3.1-flash-image-preview'} 
              onChange={e => setLocalComic({ ...localComic, artModel: e.target.value as ArtModelType })}
              className={`bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs font-bold ${contrastColor} outline-none`}
            >
              <option value="gemini-3.1-flash-image-preview">💎 Pro Render</option>
              <option value="gemini-2.5-flash-image">⚡ Fast Render</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            data-guide="genome-commit"
            onClick={() => { onUpdateComic(localComic); onAdvanceGuide?.(16); }} 
            className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition transform active:scale-95 flex items-center gap-3"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Commit DNA Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Master Aesthetic Anchor (Max 4)</h3>
              <textarea 
                value={localComic.styleDescription || ''} 
                onChange={e => setLocalComic({ ...localComic, styleDescription: e.target.value })}
                placeholder="Describe the overarching visual style, lighting, and mood..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs mb-4 outline-none focus:ring-2 focus:ring-slate-300 transition-all resize-y"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4 mb-6">
                {localComic.styleReferenceImageUrls?.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                    <CachedImage src={url} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeStyleImage(idx)}
                      className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </div>
                ))}
                {(localComic.styleReferenceImageUrls?.length || 0) < 4 && (
                  <div 
                    onDragOver={(e) => handleDragOver(e, 'style-upload')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'style', null)}
                    className={`relative aspect-square rounded-2xl border-4 border-dashed flex items-center justify-center transition-all ${
                      isDragging === 'style-upload' ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <i className={`fa-solid fa-plus ${isDragging === 'style-upload' ? 'text-brand-500' : 'text-slate-200'}`}></i>
                    <input type="file" onChange={e => e.target.files?.[0] && handleImageUpload('style', null, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Library Cinematic</h3>
                <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 group shadow-2xl">
                  {localComic.libraryVideoUrl ? (
                    <VaultVideo 
                      src={localComic.libraryVideoUrl} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                      <i className="fa-solid fa-clapperboard text-3xl opacity-20"></i>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">No Cinematic Generated</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleGenerateLibraryVideo}
                    disabled={isGeneratingVideo}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 text-white"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <i className={`fa-solid ${isGeneratingVideo ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'}`}></i>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {isGeneratingVideo ? 'Synthesizing...' : localComic.libraryVideoUrl ? 'Regenerate Loop' : 'Generate Library Loop'}
                    </span>
                  </button>
                </div>
                <p className="mt-3 text-[9px] text-slate-400 font-medium italic">Uses up to 3 reference assets to create a looping cinematic for the Vault button.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Character Archetypes & Examples</h3>
              <textarea 
                value={localComic.archetypes || ''} 
                onChange={e => setLocalComic({ ...localComic, archetypes: e.target.value })}
                placeholder="Describe common character types, behaviors, and recurring examples..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-slate-300 transition-all resize-y"
                rows={4}
              />
            </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Typography Palette</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-2">Comic / Dialogue</div>
                <div className="text-2xl text-slate-800 mb-4" style={{ fontFamily: COMIC_FONTS.find(f => f.name === (localComic.selectedFonts?.[0] || COMIC_FONTS[0].name))?.family }}>The quick brown fox jumps over the lazy dog.</div>
                <select 
                  value={localComic.selectedFonts?.[0] || COMIC_FONTS[0].name} 
                  onChange={e => {
                    const newFonts = [...(localComic.selectedFonts || [COMIC_FONTS[0].name, COMIC_FONTS[1].name, COMIC_FONTS[2].name])];
                    newFonts[0] = e.target.value;
                    setLocalComic({ ...localComic, selectedFonts: newFonts });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                  style={{ fontFamily: COMIC_FONTS.find(f => f.name === (localComic.selectedFonts?.[0] || COMIC_FONTS[0].name))?.family }}
                >
                  {COMIC_FONTS.map(font => (
                    <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>{font.name}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-2">Handwritten / Notes</div>
                <div className="text-2xl text-slate-800 mb-4" style={{ fontFamily: COMIC_FONTS.find(f => f.name === (localComic.selectedFonts?.[1] || COMIC_FONTS[1].name))?.family }}>The quick brown fox jumps over the lazy dog.</div>
                <select 
                  value={localComic.selectedFonts?.[1] || COMIC_FONTS[1].name} 
                  onChange={e => {
                    const newFonts = [...(localComic.selectedFonts || [COMIC_FONTS[0].name, COMIC_FONTS[1].name, COMIC_FONTS[2].name])];
                    newFonts[1] = e.target.value;
                    setLocalComic({ ...localComic, selectedFonts: newFonts });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                  style={{ fontFamily: COMIC_FONTS.find(f => f.name === (localComic.selectedFonts?.[1] || COMIC_FONTS[1].name))?.family }}
                >
                  {COMIC_FONTS.map(font => (
                    <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>{font.name}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-2">Modern / System</div>
                <div className="text-lg text-slate-800 mb-4" style={{ fontFamily: COMIC_FONTS.find(f => f.name === (localComic.selectedFonts?.[2] || COMIC_FONTS[2].name))?.family }}>The quick brown fox jumps over the lazy dog.</div>
                <select 
                  value={localComic.selectedFonts?.[2] || COMIC_FONTS[2].name} 
                  onChange={e => {
                    const newFonts = [...(localComic.selectedFonts || [COMIC_FONTS[0].name, COMIC_FONTS[1].name, COMIC_FONTS[2].name])];
                    newFonts[2] = e.target.value;
                    setLocalComic({ ...localComic, selectedFonts: newFonts });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                  style={{ fontFamily: COMIC_FONTS.find(f => f.name === (localComic.selectedFonts?.[2] || COMIC_FONTS[2].name))?.family }}
                >
                  {COMIC_FONTS.map(font => (
                    <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>{font.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-12 pb-40">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
              <h3 className="text-3xl font-header text-slate-800 uppercase tracking-widest">Characters</h3>
              <button data-guide="genome-char" onClick={addCharacter} className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-8 py-3 rounded-2xl hover:bg-slate-900 shadow-lg transition-all">+ Add Character</button>
            </div>
            <div className="space-y-8">
              {(localComic.characters || []).map((char, idx) => (
                <div key={char.id} className="flex gap-8 items-start bg-slate-50/40 p-8 rounded-3xl border border-slate-100 relative group">
                  <button 
                    onClick={() => removeCharacter(char.id)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-50"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                  <div className="flex flex-col gap-4 shrink-0">
                    <div 
                      onDragOver={(e) => handleDragOver(e, char.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'char', char.id)}
                      className={`w-36 h-36 bg-white border rounded-2xl overflow-hidden relative shadow-lg group/avatar transition-all ${
                        isDragging === char.id ? 'border-brand-500 ring-4 ring-brand-100' : 'border-slate-200'
                      }`}
                    >
                      {char.avatarUrl ? (
                        <CachedImage src={char.avatarUrl} className="w-full h-full object-cover" />
                      ) : char.imageUrl ? (
                        <CachedImage src={char.imageUrl} className="w-full h-full object-cover opacity-50" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-100 text-4xl">👤</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <label className="text-[8px] font-black uppercase text-white bg-white/20 px-3 py-1 rounded-full cursor-pointer hover:bg-white/30 transition-all">
                          Upload
                          <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('char', char.id, e.target.files[0])} className="hidden" />
                        </label>
                      </div>
                    </div>
                    {/* Character Assets Preview Column */}
                    <div className="flex flex-col gap-3">
                      {char.characterSheetUrl && (
                        <div className="w-36 h-20 rounded-xl border border-slate-200 overflow-hidden cursor-zoom-in shadow-sm hover:scale-105 transition-transform" onClick={() => onPreviewImage(char.characterSheetUrl!)}>
                          <CachedImage src={char.characterSheetUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {char.expressionSheetUrl && (
                        <div className="w-36 h-20 rounded-xl border border-slate-200 overflow-hidden cursor-zoom-in shadow-sm hover:scale-105 transition-transform" onClick={() => onPreviewImage(char.expressionSheetUrl!)}>
                          <CachedImage src={char.expressionSheetUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <input type="text" value={char.name} onChange={e => {
                        const nc = [...localComic.characters]; nc[idx].name = e.target.value; handleSaveProtocol({...localComic, characters: nc});
                      }} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-lg font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-slate-100 mr-4" placeholder="Subject Name" />
                      <button 
                        onClick={() => setEditingCharacterId(char.id)}
                        className="bg-slate-100 text-slate-600 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 shrink-0"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        Edit Visuals
                      </button>
                    </div>
                    <textarea value={char.description} onChange={e => {
                      const nc = [...localComic.characters]; nc[idx].description = e.target.value; handleSaveProtocol({...localComic, characters: nc});
                    }} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 outline-none focus:ring-2 focus:ring-slate-100 flex-1 min-h-[180px]" placeholder="Define visual DNA..." />
                  </div>
                </div>
              ))}
              {localComic.characters?.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No characters registered</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
              <h3 className="text-3xl font-header text-slate-800 uppercase tracking-widest">Environments</h3>
              <button onClick={addEnvironment} className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-8 py-3 rounded-2xl hover:bg-slate-900 shadow-lg transition-all">+ Add Environment</button>
            </div>
            <div className="space-y-8">
              {(localComic.environments || []).map((env, idx) => (
                <div key={env.id} className="flex gap-8 items-start bg-slate-50/40 p-8 rounded-3xl border border-slate-100 relative group">
                  <button 
                    onClick={() => removeEnvironment(env.id)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-50"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                  <div 
                    onDragOver={(e) => handleDragOver(e, `env-${env.id}`)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'env', env.id)}
                    className={`w-36 h-36 shrink-0 bg-white border rounded-2xl overflow-hidden relative shadow-lg transition-all ${
                      isDragging === `env-${env.id}` ? 'border-brand-500 ring-4 ring-brand-100' : 'border-slate-200'
                    }`}
                  >
                    {env.imageUrl ? <CachedImage src={env.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-100 text-4xl">🏞️</div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="bg-white text-slate-800 px-4 py-1.5 rounded-full font-black uppercase text-[8px] tracking-widest cursor-pointer hover:bg-slate-50 transition-all">
                        Upload
                        <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('env', env.id, e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <input type="text" value={env.name} onChange={e => {
                      const ne = [...localComic.environments]; ne[idx].name = e.target.value; handleSaveProtocol({...localComic, environments: ne});
                    }} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-lg font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-slate-100" placeholder="Locale Name" />
                    <textarea value={env.description} onChange={e => {
                      const ne = [...localComic.environments]; ne[idx].description = e.target.value; handleSaveProtocol({...localComic, environments: ne});
                    }} rows={3} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 outline-none focus:ring-2 focus:ring-slate-100" placeholder="Define atmosphere..." />
                  </div>
                </div>
              ))}
              {localComic.environments?.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No environments registered</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )}

      {croppingCharacterId && cropperImageUrl && (
        <AvatarCropper 
          imageUrl={cropperImageUrl}
          onClose={() => setCroppingCharacterId(null)}
          onSave={async (croppedUrl) => {
            const vaultedUrl = await imageStore.vaultify(croppedUrl);
            updateCharacter(croppingCharacterId, { avatarUrl: vaultedUrl });
            setCroppingCharacterId(null);
            setCropperImageUrl('');
          }}
        />
      )}

      {isRenaming && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-header uppercase tracking-tight text-slate-800 mb-2">Rename Series</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Update the production title</p>
            
            <input 
              autoFocus
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-lg font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-slate-100 transition-all mb-8"
              placeholder="Series Name"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsRenaming(false)}
                className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRename}
                className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-slate-800 text-white hover:bg-slate-900 shadow-lg transition-all"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
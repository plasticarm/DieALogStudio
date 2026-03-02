import React, { useState, useEffect } from 'react';
import { ComicProfile, Character, Environment, ArtModelType } from '../types';
import { generateEnvironmentDescription, generateCharacterImage, generateCharacterSheet, generateExpressionSheet } from '../services/gemini';
import { downscaleImage } from '../utils/imageUtils';
import { downloadImage } from '../services/utils';
import { imageStore } from '../services/imageStore';
import { auth, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

export const TrainingCenter: React.FC<TrainingCenterProps> = ({ 
  editingComic, onUpdateComic, onPreviewImage, globalColor, onUpdateGlobalColor, contrastColor, onAdvanceGuide
}) => {
  const [localComic, setLocalComic] = useState<ComicProfile>(() => JSON.parse(JSON.stringify(editingComic)));
  const [isGeneratingEnv, setIsGeneratingEnv] = useState<string | null>(null);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [croppingCharacterId, setCroppingCharacterId] = useState<string | null>(null);
  const [cropperImageUrl, setCropperImageUrl] = useState<string>('');

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
    setLocalComic(JSON.parse(JSON.stringify(editingComic)));
  }, [editingComic.id]);

  const handleSaveProtocol = (updatedState: ComicProfile) => {
    setLocalComic(updatedState);
    onUpdateComic(updatedState);
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

  const handleUploadForWeb = async (file: File, uploadId: string, updateFunc: (url: string) => void) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to upload images.");
      return;
    }

    setIsUploading(uploadId);
    try {
      // 1. Create a reference in Firebase Storage
      const storageRef = ref(storage, `user_assets/${user.uid}/${uploadId}_${file.name}`);

      // 2. Downscale the image locally first for efficiency
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        try {
          const dataUrl = await downscaleImage(event.target?.result as string, 1024);
          const blob = await (await fetch(dataUrl)).blob();

          // 3. Upload the blob to Firebase Storage
          const snapshot = await uploadBytes(storageRef, blob);

          // 4. Get the public, persistent download URL
          const downloadURL = await getDownloadURL(snapshot.ref);

          // 5. Update the state with the permanent URL
          updateFunc(downloadURL);

        } catch (e: any) {
          console.error("Image processing or upload failed:", e);
          alert(`Image upload failed: ${e.message}`);
        } finally {
          setIsUploading(null);
        }
      };
    } catch (e: any) {
      console.error("Upload failed:", e);
      alert(`Upload failed: ${e.message}`);
      setIsUploading(null);
    }
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
      setIsGeneratingVideo(true);

      const refImages: string[] = [];
      
      if (localComic.styleReferenceImageUrls?.length) {
        refImages.push(...localComic.styleReferenceImageUrls.slice(0, 3));
      }
      
      if (refImages.length < 3 && localComic.characters?.length) {
        for (const char of localComic.characters) {
          if (char.imageUrl && !refImages.includes(char.imageUrl)) {
            refImages.push(char.imageUrl);
            if (refImages.length === 3) break;
          }
        }
      }

      if (refImages.length < 3 && localComic.environments?.length) {
        for (const env of localComic.environments) {
          if (env.imageUrl && !refImages.includes(env.imageUrl)) {
            refImages.push(env.imageUrl);
            if (refImages.length === 3) break;
          }
        }
      }

      const ai = await getAiClient();
      
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
         const apiKey = (await ai.auth).apiKey;
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
      alert("Failed to generate video: " + e.message);
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

  if (editingCharacterId) {
    const char = localComic.characters.find(c => c.id === editingCharacterId);
    if (!char) {
      setEditingCharacterId(null);
      return null;
    }

    return (
      <div className="h-full flex flex-col p-10 overflow-y-auto bg-white">
        {/* ... (rest of the component remains the same, but with handleUploadForWeb calls) */}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-10 overflow-y-auto">
      {/* ... (rest of the component remains the same, but with handleUploadForWeb calls) */}
    </div>
  );
};

import { GoogleGenAI, Type } from "@google/genai";
import { ComicProfile, GeneratedPanelScript, ArtModelType } from "../types";
import { imageStore } from './imageStore';

let userApiKey: string | null = null;

/**
 * Set a custom user API key to override environment variables.
 */
export const setGeminiApiKey = (key: string | null) => {
  userApiKey = key;
};

/**
 * Get the current API key being used.
 */
export const getGeminiApiKey = () => {
  return userApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
};

/**
 * Fresh client instance using user-provided key or process.env.API_KEY.
 */
const getAiClient = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please provide one in your Architect Profile or select one via the platform.");
  }
  return new GoogleGenAI({ apiKey });
};

const handleApiError = (error: any) => {
  console.error("Gemini API Error:", error);
  
  let message = error.message || "Unknown API Error";
  
  // Try to extract message from common error structures
  if (error.error?.message) {
    message = error.error.message;
  } else if (typeof error === 'string' && error.startsWith('{')) {
    try {
      const parsed = JSON.parse(error);
      message = parsed.error?.message || message;
    } catch (e) {}
  }
  
  // Detect leaked key error
  if (message.toLowerCase().includes("leaked") || message.includes("PERMISSION_DENIED")) {
    message = "Your Gemini API key has been reported as leaked and disabled by Google. Please provide a new API key in your Architect Profile or select a paid key via the platform.";
    
    // Trigger platform key selection if available
    if (window.aistudio) {
      window.aistudio.openSelectKey().catch(console.error);
    }
  }

  window.dispatchEvent(new CustomEvent('gemini-api-error', { 
    detail: { message } 
  }));
  throw new Error(message);
};

export const generateComicScript = async (
  profile: ComicProfile,
  userPrompt: string,
  isRandom: boolean,
  panelCount: number
): Promise<{ title: string; plotDescription: string; script: GeneratedPanelScript[] }> => {
  try {
    const ai = getAiClient();
    const characterContext = (profile.characters || []).map(c => `${c.name}: ${c.description}`).join('\n');
    const environmentContext = (profile.environments || []).map(e => `${e.name}: ${e.description}`).join('\n');

    let fullPrompt = `Create a ${panelCount}-panel comic strip script for the series "${profile.name}".
    
    SERIES CONTEXT:
    Art Style: ${profile.artStyle}
    Style Description: ${profile.styleDescription || 'Not specified'}
    Archetypes: ${profile.archetypes || 'Not specified'}
    Environments: ${environmentContext}
    Characters: ${characterContext}
    
    EPISODE DIRECTIVE:
    Task: ${isRandom ? "Create a random funny or dramatic situation based on the characters and archetypes" : `Plot: ${userPrompt}`}
    
    OUTPUT SPECIFICATION:
    Return a JSON object with:
    - title (string, a catchy title for this comic strip)
    - plotDescription (string, a brief description of the plot)
    - script (array of exactly ${panelCount} objects)
    
    Each script object must have:
    - panelNumber (integer)
    - visualDescription (string, detailed for image generation)
    - dialogue (array of objects with {character: string, text: string})
    
    Ensure the story is self-contained and fits perfectly in ${panelCount} panels.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            plotDescription: { type: Type.STRING },
            script: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panelNumber: { type: Type.INTEGER },
                  visualDescription: { type: Type.STRING },
                  dialogue: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        id: { type: Type.STRING, description: "A unique short ID for this dialogue line, e.g. 'D1', 'D2'" },
                        character: { type: Type.STRING }, 
                        text: { type: Type.STRING } 
                      },
                      required: ["id", "character", "text"]
                    } 
                  }
                },
                required: ["panelNumber", "visualDescription", "dialogue"]
              }
            }
          },
          required: ["title", "plotDescription", "script"]
        }
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return {
      title: parsed.title || 'Untitled',
      plotDescription: parsed.plotDescription || '',
      script: Array.isArray(parsed.script) ? parsed.script : []
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateComicArt = async (
  profile: ComicProfile,
  script: GeneratedPanelScript[],
  model: ArtModelType
): Promise<string> => {
  try {
    const ai = getAiClient();
    const safeScript = script || [];
    const panelsDesc = safeScript.map(p => {
      const dialogueText = (p.dialogue || []).map(d => `${d.character}: ${d.text}`).join(' | ');
      return `Panel ${p.panelNumber}: ${p.visualDescription}. Dialogue: ${dialogueText}`;
    }).join('\n');
    
    let promptText = `A horizontal comic strip with ${safeScript.length} panels.
    Series: ${profile.name}
    Aesthetic: ${profile.artStyle}
    Action: ${panelsDesc}
    Note: Highly cinematic, clear panel borders, gutters, professional comic book layout. Explicitly include speech bubbles and dialogue as described in the action. Ensure the text is legible and correctly attributed to the characters.`;

    const parts: any[] = [];
    
    // Add Style References (Master Aesthetic Anchor)
    for (const url of profile.styleReferenceImageUrls || []) {
      if (url) {
        const resolvedUrl = await imageStore.getImage(url);
        if (resolvedUrl && resolvedUrl.startsWith('data:')) {
          const [header, data] = resolvedUrl.split(',');
          const mimeType = header.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          });
        }
      }
    }

    // Add Character References
    for (const char of profile.characters || []) {
      if (char.imageUrl) {
        const resolvedUrl = await imageStore.getImage(char.imageUrl);
        if (resolvedUrl && resolvedUrl.startsWith('data:')) {
          const [header, data] = resolvedUrl.split(',');
          const mimeType = header.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          });
        }
      }
    }

    parts.push({ text: promptText });

    const imageConfig: any = { aspectRatio: "16:9" };
    if (model === 'gemini-3.1-flash-image-preview') {
      imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No candidates returned from AI.");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in AI response.");
  } catch (error) {
    return handleApiError(error);
  }
};

export const removeTextFromComic = async (
  imageBase64: string, 
  model: ArtModelType,
  options?: { removeSpeechBubbles?: boolean }
): Promise<string> => {
  try {
    const ai = getAiClient();
    let prompt = `Remove all text, letters, and dialogue from this comic image. Retain only the background art and characters. Clear any speech bubbles so they are empty. CRITICAL: Do not alter the image outside the speech bubbles; preserve the original art, characters, and background exactly as they are.`;
    
    if (options?.removeSpeechBubbles) {
      prompt = `Remove all text, letters, dialogue, AND all speech bubbles from this comic image. Retain only the background art and characters. Fill in the areas where speech bubbles were with appropriate background art. CRITICAL: Do not alter the characters or the rest of the background; preserve the original art exactly as it is.`;
    }
    
    const resolvedUrl = await imageStore.getImage(imageBase64);
    if (!resolvedUrl || !resolvedUrl.startsWith('data:')) {
      throw new Error("Invalid image data provided to text removal.");
    }

    const [header, data] = resolvedUrl.split(',');
    const mimeType = header.split(';')[0].split(':')[1] || 'image/png';

    const imageConfig: any = { aspectRatio: "16:9" };
    if (model === 'gemini-3.1-flash-image-preview') {
      imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { 
        parts: [
          { 
            inlineData: { 
              data: data, 
              mimeType: mimeType
            } 
          }, 
          { text: prompt }
        ] 
      },
      config: { imageConfig }
    });
    
    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No candidates returned.");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to clear image text.");
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateEnvironmentDescription = async (theme: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Describe the visual atmosphere of an environment with theme: "${theme}".`,
    });
    return response.text || "";
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateCharacterImage = async (
  profile: ComicProfile,
  characterName: string,
  description: string,
  model: ArtModelType
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `A professional character portrait for the series "${profile.name}".
    Character: ${characterName}
    Description: ${description}
    Art Style: ${profile.artStyle}
    Style Description: ${profile.styleDescription || 'Not specified'}
    Framing: Full body or medium shot, centered, high quality.`;;

    const parts: any[] = [];
    
    // Add Style References (Master Aesthetic Anchor)
    for (const url of profile.styleReferenceImageUrls || []) {
      if (url) {
        const resolvedUrl = await imageStore.getImage(url);
        if (resolvedUrl && resolvedUrl.startsWith('data:')) {
          const [header, data] = resolvedUrl.split(',');
          const mimeType = header.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          });
        }
      }
    }

    parts.push({ text: prompt });

    const imageConfig: any = { aspectRatio: "1:1" };
    if (model === 'gemini-3.1-flash-image-preview') {
      imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No candidates returned.");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found.");
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateCharacterSheet = async (
  profile: ComicProfile,
  characterName: string,
  referenceImageUrl: string,
  model: ArtModelType
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `You are a professional 3D modeler referencing this character.
    Task: Create a precise ORTHOGRAPHIC view for 3D modeling.
    Character: ${characterName}
    Series: ${profile.name}
    Art Style: ${profile.artStyle}
    
    Key Instructions:
    1. View Direction:
       - LEFT PROFILE: character facing completely LEFT. Only left side visible. 
       - RIGHT PROFILE: character facing completely RIGHT. Only right side visible. 
       - BACK VIEW: character facing AWAY from camera. 
       - FRONT VIEW: character facing TOWARD camera. 
    3. Framing: Full body, centered, 1:1 aspect ratio. The entire character must fit within the frame.
    4. Cleanliness: NO BACKGROUND NOISE.
    6. Fidelity: Maintain 100% consistency with the reference design.`;

    const parts: any[] = [];

    // Add Style References (Master Aesthetic Anchor)
    for (const url of profile.styleReferenceImageUrls || []) {
      if (url) {
        const resolvedUrl = await imageStore.getImage(url);
        if (resolvedUrl && resolvedUrl.startsWith('data:')) {
          const [header, data] = resolvedUrl.split(',');
          const mimeType = header.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          });
        }
      }
    }

    if (referenceImageUrl.startsWith('data:')) {
      const [header, data] = referenceImageUrl.split(',');
      const mimeType = header.split(';')[0].split(':')[1];
      parts.push({ inlineData: { data: data, mimeType: mimeType } });
    }
    
    parts.push({ text: prompt });

    const imageConfig: any = { aspectRatio: "1:1" };
    if (model === 'gemini-3.1-flash-image-preview') {
      imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No candidates returned.");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found.");
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateExpressionSheet = async (
  profile: ComicProfile,
  characterName: string,
  referenceImageUrl: string,
  model: ArtModelType
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `Create a Character Expression and Pose sheet for "${characterName}" from the series "${profile.name}".
    Art Style: ${profile.artStyle}
    
    The sheet should focus on:
    1. Multiple renderings of the head isolated making different facial expressions: Happy, Sad, Angry, Confused, Surprised, Speaking, Listening.
    2. The character in a variety of poses: Walking, Talking, Running, Furious, Exasperated and other expressive full body poses.
    
    Framing: Multiple figures on a clean background, high detail, consistent character design.`;

    const parts: any[] = [];

    // Add Style References (Master Aesthetic Anchor)
    for (const url of profile.styleReferenceImageUrls || []) {
      if (url) {
        const resolvedUrl = await imageStore.getImage(url);
        if (resolvedUrl && resolvedUrl.startsWith('data:')) {
          const [header, data] = resolvedUrl.split(',');
          const mimeType = header.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              data: data,
              mimeType: mimeType
            }
          });
        }
      }
    }

    if (referenceImageUrl.startsWith('data:')) {
      const [header, data] = referenceImageUrl.split(',');
      const mimeType = header.split(';')[0].split(':')[1];
      parts.push({ inlineData: { data: data, mimeType: mimeType } });
    }
    
    parts.push({ text: prompt });

    const imageConfig: any = { aspectRatio: "1:1" };
    if (model === 'gemini-3.1-flash-image-preview') {
      imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No candidates returned.");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found.");
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateVeoVideo = async (
  imageBase64: string,
  model: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview',
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `Using the attached comic image, generate a sequential video that transitions chronologically through each panel. Expand the background art of every panel to seamlessly fill a 16:9 widescreen format. Animate the action within each panel. When a character speaks, generate voice audio and synchronize it with the original speech bubbles popping onto the screen to display the comic's text.`;

    const [header, data] = imageBase64.split(',');
    const mimeType = header.split(';')[0].split(':')[1] || 'image/png';

    onProgress?.("Initializing video generation...");
    
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      image: {
        imageBytes: data,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    onProgress?.("Video generation in progress (this may take a few minutes)...");

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      
      // Optional: you could try to estimate progress or just keep the user updated
      onProgress?.("Still processing... Veo is crafting your cinematic comic.");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation completed but no download link was found.");

    onProgress?.("Downloading final render...");

    const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey || '',
      },
    });

    if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    return handleApiError(error);
  }
};

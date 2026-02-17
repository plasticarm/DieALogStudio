import { GoogleGenAI, Type } from "@google/genai";
import { ComicProfile, GeneratedPanelScript, ArtModelType } from "../types";

/**
 * Creates a new instance of GoogleGenAI immediately before making an API call.
 * This ensures the most up-to-date API key from the user selection dialog is utilized.
 */
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateComicScript = async (
  profile: ComicProfile,
  userPrompt: string,
  isRandom: boolean,
  panelCount: number
): Promise<GeneratedPanelScript[]> => {
  const ai = getAiClient();
  const characterContext = profile.characters.map(c => `${c.name}: ${c.description}`).join('\n');
  const environmentContext = (profile.environments || []).map(e => `${e.name}: ${e.description}`).join('\n');

  let fullPrompt = `Create a ${panelCount}-panel comic strip script for "${profile.name}".
  Art Style: ${profile.artStyle}
  Environments: ${environmentContext}
  Characters: ${characterContext}
  Task: ${isRandom ? "Random funny situation" : `Plot: ${userPrompt}`}
  Return ONLY JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: fullPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            panelNumber: { type: Type.INTEGER },
            visualDescription: { type: Type.STRING },
            dialogue: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { character: { type: Type.STRING }, text: { type: Type.STRING } } } }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateComicArt = async (
  profile: ComicProfile,
  script: GeneratedPanelScript[],
  model: ArtModelType
): Promise<string> => {
  const ai = getAiClient();
  const panelsDesc = script.map(p => `Panel ${p.panelNumber}: ${p.visualDescription}`).join('\n');
  const dialogDesc = script.map(p => `Panel ${p.panelNumber} Dialogue: ${p.dialogue.map(d => `${d.character} says "${d.text}"`).join(', ')}`).join('\n');
  
  let promptText = `Horizontal ${script.length}-panel comic strip. Style: ${profile.artStyle}. Content: ${panelsDesc}. Include legible speech bubbles and dialogue text for characters: ${dialogDesc}. Use the provided character descriptions for visual consistency.`;

  const parts: any[] = [{ text: promptText }];
  profile.characters.forEach(char => {
    if (char.imageUrl?.startsWith('data:')) {
      parts.push({ text: `Visual reference for ${char.name}:` }, { inlineData: { data: char.imageUrl.split(',')[1], mimeType: char.imageUrl.split(';')[0].split(':')[1] } });
    }
  });

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated");
};

export const removeTextFromComic = async (imageBase64: string, model: ArtModelType): Promise<string> => {
  const ai = getAiClient();
  // More aggressive prompt for text removal
  const prompt = `This is a comic strip. Please edit this image to REMOVE ALL DIALOGUE TEXT from the speech bubbles. The bubbles must remain but they should be completely white and empty inside. Do not change anything else in the image. This is for an export copy where I will add my own text later.`;
  
  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } }, { text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error("Failed text removal");
};

export const generateEnvironmentDescription = async (theme: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Visual description for: "${theme}".`,
  });
  return response.text || "";
};
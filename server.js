// ✅ SAFE: Calls your backend instead
// You don't need to import GoogleGenAI anymore

async function generateStory(promptText) {
  // 1. Point to your Render Backend
  const BACKEND_URL = "https://my-ai-backend-xvc1.onrender.com"; 

  try {
    const response = await fetch(`${BACKEND_URL}/api/google/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Pass the data your backend expects
        model: 'gemini-1.5-flash',
        contents: [
            { role: 'user', parts: [{ text: promptText }] }
        ]
      })
    });

    const data = await response.json();
    
    // The result comes back from your backend, usually in data.candidates...
    const storyText = data.candidates[0].content.parts[0].text;
    return storyText;

  } catch (error) {
    console.error("Error connecting to backend:", error);
  }
}
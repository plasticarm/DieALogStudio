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

// ✅ NEW: Talk to your Render Backend
async function generateImage(promptText) {
  // 1. Point to your Render URL (Make sure this is YOUR actual Render link)
  const BACKEND_URL = "https://my-ai-backend-xvc1.onrender.com"; 

  console.log("Asking backend to generate image...");

  try {
    // 2. Send the "Order" to the Backend
    const response = await fetch(`${BACKEND_URL}/api/google/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: promptText,
        aspectRatio: "1:1", // Optional: Change if you have a selector
        numberOfImages: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    // 3. Receive the "Meal" (The Image)
    const data = await response.json();
    
    // Your backend returns { images: ["data:image/png..."] }
    // So we return the first image string
    return data.images[0]; 

  } catch (error) {
    console.error("Failed to generate image:", error);
    alert("Image generation failed. Check console for details.");
    return null;
  }
}
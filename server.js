const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
// Import Google Generative AI library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load keys from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Tell the server to share files from the 'public' folder
app.use(express.static('public'));
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// --- API ROUTE: GENERATE TEXT ---
app.post('/api/generate-text', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ text });
    } catch (error) {
        console.error("Error generating text:", error);
        res.status(500).json({ error: "Failed to generate text" });
    }
});

// --- API ROUTE: GENERATE IMAGE (NanoBanana placeholder) ---
// Note: You'll need to replace the URL/logic below with the specific 
// NanoBanana documentation, but the structure remains the same.
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // This is where you call the NanoBanana API from the server
        // Example (adjust based on their actual docs):
        const response = await fetch('https://api.nanobanana.com/v1/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NANOBANANA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        res.json(data); // Send the image URL/data back to your frontend
        
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
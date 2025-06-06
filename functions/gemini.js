const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_KEY;
console.log(`This is your Gemini Key: ${GEMINI_API_KEY}`)

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Function to load knowledge base
const loadKnowledgeBase = async () => {
    try {
        const kbPath = path.join(__dirname, '../database/kb.txt');
        const knowledgeBase = fs.readFileSync(kbPath, 'utf8');
        return knowledgeBase;
    } catch (error) {
        console.error('Error loading knowledge base:', error);
        return null;
    }
};


const GeminiResponse = async (user_prompt) => {
    try {
        const modelName = 'gemini-2.0-flash-lite'

        // Generate response using the Gemini model
        const response = await ai.models.generateContent({
            model: modelName,
            contents: user_prompt,
            config: { systemInstruction: await loadKnowledgeBase() },
        });

        return {
            status: 'success',
            message: response.text,
        }
    } catch (error) {
        console.error('Error generating Gemini response:', error);
        return {
            status: 'error',
            message: 'Failed to generate response from Gemini AI',
        }
    }
}

module.exports = {
    GeminiResponse,
};
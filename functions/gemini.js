const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_KEY;
console.log(`This is your Gemini Key: ${GEMINI_API_KEY}`)

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Function to load knowledge base

const GeminiResponse = async (user_prompt) => {
    try {
        //knowledge base
        const kbPath = path.join(__dirname, '../database/kb.txt') || null;
        const kb = await ai.files.upload({
            file: kbPath, config: { mimeType: 'text/plain' }
        })
        const modelName = 'gemini-2.0-flash-lite'

        //cache the knowledge base
        const cache = await ai.caches.create({
            model: modelName,
            config: {
                contents: createUserContent(createPartFromUri(kb.uri, kb.mimeType)),
                systemInstruction: "You are a helpful and friendly assistant for Shemdoe Tours.",
            },
        });
        console.log("Cache created:", cache);

        // Generate response using the Gemini model
        const response = await ai.models.generateContent({
            model: modelName,
            contents: user_prompt,
            config: {cachedContent: cache.name}
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
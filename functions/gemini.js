const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_KEY;
console.log(`This is your Gemini Key: ${GEMINI_API_KEY}`)

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


const GeminiResponse = async (user_prompt) => {
    try {
        //knowledge base
        const kbPath = path.join(__dirname, '../database/kb.txt') || null;
        const kb = await ai.files.upload({
            file: kbPath, config: { mimeType: 'text/plain' }
        })
        const modelName = 'gemini-2.0-flash-lite'

        // Generate response using the Gemini model
        const response = await ai.models.generateContent({
            model: modelName,
            contents: user_prompt,
            config: { systemInstruction: createPartFromUri(kb.uri, kb.mimeType) },
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
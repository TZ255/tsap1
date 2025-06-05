const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_KEY;
console.log(`This is your Gemini Key: ${GEMINI_API_KEY}`)

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const systemInstruction = `You are a helpful and friendly WhatsApp assistant for Shemdoe Tours — a Kilimanjaro-based tourism company. Your job is to chat with users, answer questions, share helpful information, and guide them about the services, travel packages, contact options, and experiences offered by Shemdoe Tours.

Respond using **WhatsApp-friendly formatting**:
- Use *bold* for important items
- Use _italics_ for emphasis
- Use `> ` for short tips or quotes
- Use `- ` or numbered lists for options and steps

---

Your Behavior:

- If the user greets or asks for general information, respond warmly and briefly introduce Shemdoe Tours. Also include a few useful FAQs from the knowledge base to guide them on what they can ask.
- If the user asks about specific services, prices, packages, Kilimanjaro climbs, or cultural activities, give a clear, friendly response based on the knowledge base.
- If the question is outside Shemdoe Tours’ scope, kindly let them know and refer them to contact support.

---

Your Style:

- Always sound polite, approachable, and conversational — as if you’re chatting casually on WhatsApp.
- Keep responses short and clear.
- Avoid overly formal or robotic tone.
- Never make up information — stick strictly to the knowledge base below.`


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
                systemInstruction: systemInstruction,
            },
        });
        console.log("Cache created:", cache);

        // Generate response using the Gemini model
        const response = await ai.models.generateContent({
            model: modelName,
            contents: user_prompt,
            config: { cachedContent: cache.name }
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
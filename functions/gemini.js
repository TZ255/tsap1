const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_KEY;
console.log(GEMINI_API_KEY)

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const GeminiResponse = async (prompt) => {
    const k_base = ''
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: prompt,
        });
        console.log(response.text);
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
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Utility function to get MIME type from URL
function getMimeTypeFromUrl(url) {
    const ext = path.extname(url.split('?')[0]).toLowerCase();
    const mimeTypes = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
        '.flac': 'audio/flac'
    };
    return mimeTypes[ext] || 'audio/mpeg';
}

// Utility function to get filename from URL
function getFileNameFromUrl(url) {
    try {
        const urlPath = new URL(url).pathname;
        return path.basename(urlPath) || `audio_${Date.now()}.mp3`; // Fallback if no filename found
    } catch {
        return null;
    }
}

// Utility function to sanitize filename for WhatsApp compatibility
function sanitizeFileName(fileName) {
    // Remove or replace problematic characters
    return fileName
        .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        .substring(0, 100); // Limit length
}

// Main function to send audio from direct download link
async function sendAudioFromUrl(client, MessageMedia, chatId, audioUrl, caption, fileName) {
    try {
        console.log('Downloading audio from:', audioUrl);

        // Download the audio file
        const response = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Convert to base64
        const base64Data = Buffer.from(response.data).toString('base64');

        // Get MIME type from response headers or URL
        let mimeType = response.headers['content-type'];
        if (!mimeType || !mimeType.startsWith('audio/')) {
            mimeType = getMimeTypeFromUrl(audioUrl);
        }

        // Generate filename if not provided
        let fname = fileName || getFileNameFromUrl(audioUrl);
        let processedFileName = sanitizeFileName(fname);
        console.log('Processed filename:', processedFileName);

        // Create MessageMedia object
        const media = new MessageMedia(mimeType, base64Data, processedFileName);

        // Send the audio
        await client.sendMessage(chatId, media, { sendMediaAsDocument: true, caption: caption });
        console.log('Audio sent successfully!');

        return true;

    } catch (error) {
        console.error('Error sending audio from URL:', error.message);
        return false;
    }
}



module.exports = {
    sendAudioFromUrl
}
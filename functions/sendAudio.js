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
function getFileNameFromUrl(url, defaultExtension = '.mp3') {
    try {
        const urlPath = decodeURIComponent(new URL(url).pathname);
        const baseName = path.basename(urlPath);
        return baseName || `audio_${Date.now()}${defaultExtension}`;
    } catch (err) {
        console.error('Invalid URL:', err.message);
        return null;
    }
}

// Utility function to sanitize filename for WhatsApp compatibility
function sanitizeFileName(fileName) {
    return fileName
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '') // Remove invalid characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/\.+$/, '') // Remove trailing dots
        .slice(0, 100); // Limit to 100 characters
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
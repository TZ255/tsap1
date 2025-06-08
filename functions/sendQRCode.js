const QRCode = require('qrcode');
const axios = require('axios');

// Function to send QR code to Telegram
async function sendQRToTelegram(qrString) {
    try {
        // Generate QR code as base64 image
        const qrImageBuffer = await QRCode.toBuffer(qrString, {
            type: 'png',
            width: 512,
            margin: 2
        });

        const tgAPI = `https://api.telegram.org/bot${process.env.INFO_BOT}/sendPhoto`;
        
        // Create form data for sending photo
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('chat_id', 741815228);
        form.append('photo', qrImageBuffer, 'qrcode.png');
        form.append('caption', '🤖 WhatsApp Bot QR Code\nScan this code with WhatsApp to connect the bot');

        await axios.post(tgAPI, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('QR code sent to Telegram successfully!');
    } catch (error) {
        console.error('Error sending QR to Telegram:', error.message);
        
        // Fallback: send error message to Telegram
        const tgAPI = `https://api.telegram.org/bot${process.env.INFO_BOT}/sendMessage`;
        const data = {
            chat_id: 741815228,
            text: `❌ Failed to send QR code: ${error.message}`
        };
        
        axios.post(tgAPI, data)
            .catch(e => console.error('Failed to send error message to Telegram:', e.message));
    }
}

module.exports = {
    sendQRToTelegram
}

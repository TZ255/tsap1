const { Client, LocalAuth, MessageMedia  } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GeminiResponse } = require('./functions/gemini');
const { sendAudioFromUrl } = require('./functions/sendAudio');
require('dotenv').config();

// Add at the top of bot.js
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error);
    process.exit(1);
});

// Create client with local authentication
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR code for authentication
client.on('qr', (qr) => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Client is ready
client.on('ready', async () => {
    try {
        console.log('WhatsApp bot is ready!');
        return await client.sendMessage(process.env.SHEMDOE_NUM, 'Whatsapp bot is online! 🤖');
    } catch (error) {
        console.error('Error during client initialization:', error);
    }
});

// Handle incoming messages
client.on('message', async (message) => {
    try {
        console.log(`Message from ${message.from}: ${message.body}`);
        console.log(`Message type: ${message.type}`);
        
        // Only process chat messages
        if (message.type !== 'chat') {
            console.log(`Ignoring non-chat message from ${message.from}`);
            const audioUrl = 'https://dl.globalkiki.com/uploads/Marioo%20-%20HA%20HA%20HA.mp3'
            const caption = 'AUDIO | Marioo – HA HA HA'

            await sendAudioFromUrl(client, MessageMedia, message.from, audioUrl, caption, null)
            return;
        }

        const msg = message.body?.trim();
        
        // Handle empty or invalid messages
        if (!msg) {
            return;
        }

        // Handle status command
        if (msg.toLowerCase() === 'status') {
            const user = message.notifyName || message.from.split('@')[0];
            return await message.reply(`Karibu ${user}!\n\nAcha wenge, robot inafanya kazi`);
        }

        // Process message with Gemini
        const response = await GeminiResponse(msg);
        
        if (response?.status === 'success' && response.message) {
            await message.reply(response.message);
        } else {
            await message.reply('Sorry, I am a chatbot and I couldnt process your message. Wait a few minute for the owner to come to help you. Thank you!');
        }

    } catch (error) {
        console.error('Error handling message:', error);
        
        // Try to send error response to user if possible
        try {
            await message.reply('An error occurred while processing your message. Please try again.');
        } catch (replyError) {
            console.error('Failed to send error message to user:', replyError);
        }
    }
});

// Handle authentication failure
client.on('auth_failure', (message) => {
    console.error('Authentication failed:', message);
});

// Handle disconnection
client.on('disconnected', async (reason) => {
    console.log('Client was logged out:', reason);
    try {
        return await client.sendMessage(process.env.SHEMDOE_NUM, 'Whatsapp bot is offline! 🤖');
    } catch (error) {
        console.log('Whatsapp bot is offline! 🤖');
    }
});

// Initialize the client
client.initialize();
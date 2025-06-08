const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GeminiResponse } = require('./functions/gemini');
const { sendAudioFromUrl } = require('./functions/sendAudio');
const { postGrantVip } = require('./functions/post');
const { sendQRToTelegram, sendMessageToTelegram } = require('./functions/sendQRCode');
require('dotenv').config();

// Add at the top of bot.js
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error);
    process.exit(1);
});

//login logout programatically variable
let isPaused = false;

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

    // Send QR code to Telegram
    sendQRToTelegram(qr).catch(e => console.log(e.message));
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

        const nyimboMpya = '120363401810537822@newsletter'
        const chatid = message.from
        const mk_vip = '255711935460@c.us'

        // Only process chat messages
        if (message.type !== 'chat') {
            return;
        }

        const msg = message.body?.trim();

        // Handle empty or invalid messages
        if (!msg) {
            return;
        }

        if (msg.toLocaleLowerCase().startsWith('grant ') && chatid === mk_vip) {
            let [email, param] = msg.split(' ').slice(1)

            if (!email || !param) {
                return await message.reply('Invalid command format. Use: grant <email> <param>');
            }

            email = email.toLowerCase();

            let result = await postGrantVip(email, param)
            return await message.reply(result.message)
        }

        // Handle status command
        if (msg.toLowerCase() === 'status') {
            const user = message.notifyName || message.from.split('@')[0];
            return await message.reply(`Karibu ${user}!\n\nAcha wenge, robot inafanya kazi`);
        }

        //login && logout
        if (msg === 'bot logout' && chatid == process.env.SHEMDOE_NUM) {
            if (isPaused) {
                return await message.reply('Bot is already paused.');
            }

            await client.destroy();
            isPaused = true;
            return await message.reply('Bot has been paused (destroyed).');
        }

        // Command: login
        if (msg === 'bot login' && chatid == process.env.SHEMDOE_NUM) {
            if (!isPaused) {
                return await message.reply('Bot is already running.');
            }

            await client.initialize();
            isPaused = false;
            return await message.reply('Bot has been resumed (initialized).');
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
client.on('auth_failure', async (message) => {
    console.error('Authentication failed:', message);
    try {
        return await sendMessageToTelegram(741815228, `WhatsApp Auth failed ❌\nReason: ${message}`)
    } catch (error) {
        console.log('Whatsapp bot is offline! 🤖');
    }
});

// Handle disconnection
client.on('disconnected', async (reason) => {
    console.log('Client was logged out:', reason);
    try {
        return await sendMessageToTelegram(741815228, `WhatsApp Bot is Offline\nReason: ${reason}`)
    } catch (error) {
        console.log('Whatsapp bot is offline! 🤖');
    }
});

// Initialize the client
client.initialize();
const express = require('express')
const mongoose = require('mongoose')
var cors = require('cors')
const app = express()

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GeminiResponse } = require('./functions/gemini');
const fs = require('fs');
const path = require('path');
const { sendAudioFromUrl } = require('./functions/sendAudio');
const { postGrantVip } = require('./functions/post');
const { sendQRToTelegram, sendMessageToTelegram } = require('./functions/sendQRCode');
const { createClient, HandleWhatsAppMessages, sendMessageWhatsApp, formatEnglishClub } = require('./functions/messagesHandler');
require('dotenv').config();

// Add at the top of bot.js
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error);
    process.exit(1);
});

// database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to Scraping database'))
    .catch((err) => {
        console.log(err)
    })

const imp = {
    englishClub: "120363417496609622@newsletter",
    shemdoe: process.env.SHEMDOE_NUM,
    mk_vip: '255711935460@c.us',
    nyimboMpya: '120363401810537822@newsletter'
}

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('trust proxy', true)
app.use(cors())

// WHATSAPP CLIENT SETUP
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
HandleWhatsAppMessages(client, imp);
// Initialize the client
client.initialize();


app.get('/', (req, res) => {
    res.send('Welcome to the WhatsApp Bot API');
});

app.post('/post/english', async (req, res) => {
    try {
        const wordObj = req.body;

        if (!wordObj) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const message = await formatEnglishClub(wordObj)
        await sendMessageWhatsApp(client, message, imp.englishClub);
        res.status(200).json({ message: 'Word sent successfully' });
    } catch (error) {
        console.error('Error saving word:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(process.env.PORT || 3100, () => {
    console.log(`Server is running on port ${process.env.PORT || 3100}`);
});
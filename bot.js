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
const { createClient } = require('./functions/createClient');
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

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('trust proxy', true)
app.use(cors())

// WHATSAPP CLIENT SETUP
createClient();


//set interval to get the english club database
setInterval(() => {
    const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi' });
    const [h, m, s] = now.split(':').map(Number);

    if (h === 9 && process.env.environment !== 'local') {
        if (m === 0) saveWordToDatabase('idiom');
        if (m === 5) saveWordToDatabase('phrase');
        if (m === 10) saveWordToDatabase('slang');
    }
}, 60000);

app.get('/', (req, res) => {
    res.send('Welcome to the WhatsApp Bot API');
});


app.listen(process.env.PORT || 3100, () => {
    console.log(`Server is running on port ${process.env.PORT || 3100}`);
});
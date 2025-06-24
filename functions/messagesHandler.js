const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GeminiResponse } = require('./gemini');
const fs = require('fs');
const path = require('path');
const { sendAudioFromUrl } = require('./sendAudio');
const { postGrantVip } = require('./post');
const { sendQRToTelegram, sendMessageToTelegram } = require('./sendQRCode');
require('dotenv').config();


const HandleWhatsAppMessages = (client, imp) => {

    const allowedChats = [imp.shemdoe, imp.mk_vip]

    //login logout programatically variable
    let isPaused = false;

    // Handle incoming messages
    client.on('message', async (message) => {
        try {
            console.log(`Message from ${message.from}: ${message.body}`);
            console.log(`Message type: ${message.type}`);

            const chatid = message.from

            // Only process chat messages
            if (message.type !== 'chat' || !allowedChats.includes(chatid)) {
                return;
            }

            const msg = message.body?.trim();

            // Handle empty or invalid messages
            if (!msg) {
                return;
            }

            if (msg.toLocaleLowerCase().startsWith('grant ') || msg.toLocaleLowerCase().startsWith('/grant ') && chatid === imp.mk_vip) {
                let match = String(msg.toLowerCase().split('grant ')[1]).toLowerCase().trim()
                if (match.includes('mail: ')) match = match.split('mail: ')[1];

                let [email, param] = match.split(' ')

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
            if (msg === 'bot destroy' && chatid == process.env.SHEMDOE_NUM) {

                await message.reply('Bot destroyed (tab closed). No need for new QR to login again, just restart the app');
                return await client.destroy()
            }

            // Command: logout completely to send new qr
            if (msg === 'bot logout' && chatid == process.env.SHEMDOE_NUM) {

                await message.reply('Bot has been shutdown. Needs new QR to login again');
                await client.logout()
                await client.destroy() //shut the client tab
                return fs.rmSync('./.wwebjs_auth', { recursive: true, force: true }); // Deletes session folder
            }

            if (msg.toLowerCase() === 'admin help' && chatid === process.env.SHEMDOE_NUM) {
                const helpText = `🤖 Admin Commands:  
    - *status* - Check bot status
    - *bot destroy* - Destroy the client. Relogin on restart.... No need for QR
    - *bot logout* - Force bot logout. Need new QR scan
    - *grant <email> <param>* - Grant VIP access
    - *admin help* - Show this help message`;

                return await message.reply(helpText);
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
}

const sendMessageWhatsApp = async (client, message, chatId) => {
    try {
        await client.sendMessage(chatId, message);
    } catch (error) {
        console.error('Error sending message:', error);
        sendMessageToTelegram(741815228, `Error sending message to WhatsApp: ${error.message}`);
    }
}

const formatEnglishClub = async (wordObj) => {
    try {
        const { type, term, meaning, examples, challenge } = wordObj;

        if (!type || !term || !meaning || !examples || !challenge) {
            throw new Error('Missing required fields');
        }

        return `🌟 *${type.toUpperCase()} of the Day* 🌟  
*🗣️ "${term}"*

📘 *Meaning:*  
> ${meaning.english}

🇹🇿 *Swahili:*  
> ${meaning.swahili}

✍️ *Example Sentences:*

1). ${examples[0].en}
> 🇹🇿 ${examples[0].sw}

2). ${examples[1].en}
> 🇹🇿 ${examples[1].sw}

3). ${examples[2].en}
> 🇹🇿 ${examples[2].sw}


💬 *Challenge for Today:*  
> ${challenge.text}`;

    } catch (error) {
        console.error('Error sending message:', error);
        sendMessageToTelegram(741815228, `Error sending message to WhatsApp: ${error.message}`);
    }
}

module.exports = { HandleWhatsAppMessages, sendMessageWhatsApp, formatEnglishClub };
// This function creates and initializes a WhatsApp client using the whatsapp-web.js library.
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

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
    console.log(`Message from ${message.from}: ${message.body}`);

    // Simple echo bot - responds to messages
    if (message.body.toLowerCase() === 'hello') {
        await message.reply('Hello! I am your WhatsApp bot 🤖');
    } else if (message.body.toLowerCase() === 'ping') {
        await message.reply('Pong! 🏓');
    } else if (message.body.toLowerCase() === 'help') {
        await message.reply('Available commands:\n- hello\n- ping\n- help');
    }
});

// Handle authentication failure
client.on('auth_failure', (message) => {
    console.error('Authentication failed:', message);
});

// Handle disconnection
client.on('disconnected', (reason) => {
    console.log('Client was logged out:', reason);
});

// Initialize the client
client.initialize();
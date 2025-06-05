const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create client with local authentication
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate QR code for authentication
client.on('qr', (qr) => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, {small: true});
});

// Client is ready
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
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
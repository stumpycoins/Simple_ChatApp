const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const MESSAGE_FILE = 'messages.json';
const MESSAGE_EXPIRY_DAYS = 10; // Delete messages older than 10 days

// Read messages from a file (if it exists)
const loadMessages = () => {
    try {
        const data = fs.readFileSync(MESSAGE_FILE);
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Write messages to a file
const saveMessages = (messages) => {
    fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
};

// Function to remove messages older than 10 days
const cleanOldMessages = () => {
    const now = Date.now();
    const cutoff = now - MESSAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    // Filter messages to only include those within the last 10 days
    messageHistory = messageHistory.filter((msg) => new Date(msg.timestamp).getTime() > cutoff);

    // Save the updated messages back to the file
    saveMessages(messageHistory);
};

// Periodically clean up old messages
setInterval(cleanOldMessages, 24 * 60 * 60 * 1000); // Run daily

// Store messages in memory
let messageHistory = loadMessages();
cleanOldMessages(); // Initial cleanup on server start

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Handle new connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send existing chat history to the new user
    socket.emit('chat history', messageHistory);

    // Listen for incoming messages
    socket.on('chat message', (msg) => {
        // Add a timestamp to the message
        msg.timestamp = new Date().toISOString();

        // Store the message in memory
        messageHistory.push(msg);

        // Save the updated message history to the file
        saveMessages(messageHistory);

        // Broadcast the message to all connected clients
        io.emit('chat message', msg);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

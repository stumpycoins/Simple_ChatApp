const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const searchInput = document.getElementById('searchInput'); // The search input field

let allMessages = []; // Store all the messages

// Prompt the user for a username
const username = prompt('Enter your name:') || 'Anonymous';

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        const message = {
            user: username,
            text: input.value,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        socket.emit('chat message', message);
        input.value = '';
    }
});

// Handle incoming messages
socket.on('chat message', (msg) => {
    allMessages.push(msg); // Store the message
    renderMessages(allMessages); // Re-render the messages with the new one
});

// Handle sending message history when a new user connects
socket.on('chat history', (history) => {
    allMessages = history; // Store the existing chat history
    renderMessages(allMessages); // Render the existing chat history
});

// Function to render messages
function renderMessages(messagesArray) {
    // Clear all previous messages
    messages.innerHTML = '';

    // Filter messages based on the search query
    const searchQuery = searchInput.value.toLowerCase();
    const filteredMessages = messagesArray.filter((msg) =>
        msg.text.toLowerCase().includes(searchQuery)
    );

    // Render each filtered message
    filteredMessages.forEach((msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(msg.user === username ? 'sent' : 'received');

        const usernameDiv = document.createElement('div');
        usernameDiv.textContent = msg.user;
        usernameDiv.classList.add('username');
        messageDiv.appendChild(usernameDiv);

        const textDiv = document.createElement('div');
        textDiv.textContent = msg.text;
        messageDiv.appendChild(textDiv);

        const timestampDiv = document.createElement('div');
        timestampDiv.textContent = msg.time;
        timestampDiv.classList.add('timestamp');
        messageDiv.appendChild(timestampDiv);

        messages.appendChild(messageDiv);
    });

    messages.scrollTop = messages.scrollHeight; // Auto-scroll to the bottom
}

// Event listener for the search input field
searchInput.addEventListener('input', () => {
    renderMessages(allMessages); // Re-render the messages when the search query changes
});

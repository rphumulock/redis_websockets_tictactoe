import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Connect to the WebSocket server

// Listen for WebSocket connection
socket.on('connect', () => {
    console.log('Connected to server:', socket.id);

    // Send a test message to publish to Redis
    const testMessage = 'Hello Redis!';
    console.log('Sending message to Redis via WebSocket:', testMessage);
    socket.emit('publish-to-redis', testMessage);
});

// Listen for Redis messages from the server
socket.on('redis-message', (message) => {
    console.log('Received message from Redis:', message);
});

// Handle disconnect
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

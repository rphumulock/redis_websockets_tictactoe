import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';

dotenv.config();

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        // origin: '*', // Allow all origins for testing purposes
        origin: 'http://localhost:5173', // Frontend running on Vite
        methods: ['GET', 'POST'],
        transports: ['websocket'] // Only allow WebSocket transport
    },
    allowEIO3: true // Allow older Engine.IO versions for compatibility
});

// Initialize Redis clients
const pubClient = createClient({ url: REDIS_URL });
const subClient = createClient({ url: REDIS_URL });

// Connect Redis clients with logs
try {
    await pubClient.connect();
    console.log('Redis Publisher Client connected');
    await subClient.connect();
    console.log('Redis Subscriber Client connected');
} catch (err) {
    console.error('Error connecting to Redis:', err);
}

// Game state
let gameState = {
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null
};

// Function to calculate the winner
function calculateWinner(board) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// Function to reset the game state
function resetGame() {
    gameState = {
        board: Array(9).fill(null),
        xIsNext: true,
        winner: null
    };
}

// Subscribe to Redis channel for game state updates
await subClient.subscribe('game-moves', (message) => {
    console.log('Received message from Redis:', message);
    gameState = JSON.parse(message);
    io.emit('gameState', gameState);
});

// Subscribe to Redis channel for game state updates
await subClient.subscribe('test-channel', (message) => {
    console.log('Received message from Redis:', message);
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Send a welcome message to the client
    socket.emit('message', 'Welcome to the WebSocket server!');

    // Send the current game state to the new client
    socket.emit('gameState', gameState);

    // Handle a move
    socket.on('makeMove', (index) => {
        if (gameState.board[index] || gameState.winner) return;

        // Update the game state
        gameState.board[index] = gameState.xIsNext ? 'X' : 'O';
        gameState.xIsNext = !gameState.xIsNext;
        gameState.winner = calculateWinner(gameState.board);

        // Publish the updated game state to Redis
        pubClient.publish('game-moves', JSON.stringify(gameState));

        // Broadcast the new game state to all connected clients
        io.emit('gameState', gameState);
    });

    // Handle a custom event for testing Redis
    socket.on('publish-to-redis', (data) => {
        console.log('Publishing to Redis:', data);
        pubClient.publish('test-channel', data);
    });

    // Handle game restart
    socket.on('restartGame', () => {
        resetGame();
        io.emit('gameState', gameState);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Test route to verify server is running
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', time: new Date() });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';

dotenv.config();

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Initialize Redis clients
const pubClient = createClient({ url: REDIS_URL });
const subClient = createClient({ url: REDIS_URL });

(async () => {
    try {
        await pubClient.connect();
        console.log('Redis Publisher Client connected');
        await subClient.connect();
        console.log('Redis Subscriber Client connected');
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }

    // Subscribe to Redis channel
    await subClient.subscribe('game-moves', (message) => {
        console.log('Received message from Redis:', message);

        // Broadcast the message to all connected WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    });
})();

// Game state
let gameState = {
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null,
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
        [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    // Send the current game state to the new client
    ws.send(JSON.stringify({ type: 'gameState', data: gameState }));

    // Handle incoming messages
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        // Handle a move
        if (parsedMessage.type === 'makeMove') {
            const index = parsedMessage.data;
            if (gameState.board[index] || gameState.winner) return;

            // Update the game state
            gameState.board[index] = gameState.xIsNext ? 'X' : 'O';
            gameState.xIsNext = !gameState.xIsNext;
            gameState.winner = calculateWinner(gameState.board);

            // Publish the updated game state to Redis
            pubClient.publish('game-moves', JSON.stringify(gameState));
        }

        // Handle game restart
        if (parsedMessage.type === 'restartGame') {
            gameState = {
                board: Array(9).fill(null),
                xIsNext: true,
                winner: null,
            };
            pubClient.publish('game-moves', JSON.stringify(gameState));
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

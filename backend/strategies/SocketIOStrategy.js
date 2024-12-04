import { Server as SocketIOServer } from "socket.io";
import {
  gameState,
  calculateWinner,
  resetGame,
  isBoardFull,
} from "../game/gameState.js";

export default function initSocketIO(server, pubClient, subClient) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  const players = { X: null, O: null }; // Track players

  subClient.subscribe("game-moves", (message) => {
    const state = JSON.parse(message);
    Object.assign(gameState, state);
    io.emit("gameState", gameState);
  });

  io.on("connection", (socket) => {
    console.log(`Socket.IO client connected: ${socket.id}`);

    // Assign player role
    let assignedRole = null;
    if (!players.X) {
      players.X = socket;
      assignedRole = "X";
    } else if (!players.O) {
      players.O = socket;
      assignedRole = "O";
    } else {
      // Reject additional players
      socket.emit("error", "Game is full. Try again later.");
      socket.disconnect();
      console.log(`Connection rejected: Game is full (${socket.id})`);
      return;
    }

    // Emit role assignment and current game state
    socket.emit("playerAssignment", { playerRole: assignedRole, gameState });
    console.log(`Assigned Player ${assignedRole} to ${socket.id}`);

    socket.on("makeMove", (index) => {
      if (
        gameState.board[index] || // Invalid move (cell occupied)
        gameState.winner || // Game already won
        assignedRole !== (gameState.xIsNext ? "X" : "O") // Not this player's turn
      ) {
        console.warn(`Invalid move attempt by Player ${assignedRole}`);
        return;
      }

      // Update game state
      gameState.board[index] = assignedRole;
      gameState.xIsNext = !gameState.xIsNext;
      gameState.winner = calculateWinner(gameState.board);
      gameState.draw = isBoardFull(gameState.board) && !gameState.winner;

      // Publish updated game state
      pubClient.publish("game-moves", JSON.stringify(gameState));
    });

    socket.on("restartGame", () => {
      resetGame();
      pubClient.publish("game-moves", JSON.stringify(gameState));
    });

    socket.on("disconnect", () => {
      console.log(`Socket.IO client disconnected: ${socket.id}`);
      if (players.X === socket) {
        players.X = null;
      } else if (players.O === socket) {
        players.O = null;
      }
    });
  });

  console.log("Socket.IO initialized");
}

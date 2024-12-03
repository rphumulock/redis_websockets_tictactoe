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

  subClient.subscribe("game-moves", (message) => {
    const state = JSON.parse(message);
    Object.assign(gameState, state);
    io.emit("gameState", gameState);
  });

  io.on("connection", (socket) => {
    console.log(`Socket.IO client connected: ${socket.id}`);
    socket.emit("gameState", gameState);

    socket.on("makeMove", (index) => {
      if (gameState.board[index] || gameState.winner) return;

      gameState.board[index] = gameState.xIsNext ? "X" : "O";
      gameState.xIsNext = !gameState.xIsNext;
      gameState.winner = calculateWinner(gameState.board);
      gameState.draw = isBoardFull(gameState.board) && !gameState.winner;

      pubClient.publish("game-moves", JSON.stringify(gameState));
    });

    socket.on("restartGame", () => {
      resetGame();
      pubClient.publish("game-moves", JSON.stringify(gameState));
    });

    socket.on("disconnect", () => {
      console.log(`Socket.IO client disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.IO initialized");
}

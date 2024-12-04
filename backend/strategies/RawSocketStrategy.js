import { WebSocketServer } from "ws";
import {
  gameState,
  calculateWinner,
  resetGame,
  isBoardFull,
} from "../game/gameState.js";

export default function initRawWebSocket(server, pubClient, subClient) {
  const wss = new WebSocketServer({ server });
  const players = { X: null, O: null }; // Map to track assigned players

  // Subscribe to Redis channel
  subClient.subscribe("game-moves", (message) => {
    try {
      const state = JSON.parse(message);
      Object.assign(gameState, state);

      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: "gameState", data: gameState }));
        }
      });
    } catch (error) {
      console.error("Error in Redis subscription:", error);
    }
  });

  wss.on("connection", (ws) => {
    console.log("New client connected");

    // Assign player role
    let assignedRole = null;
    if (!players.X) {
      players.X = ws;
      assignedRole = "X";
    } else if (!players.O) {
      players.O = ws;
      assignedRole = "O";
    } else {
      // Reject additional connections
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Game is full. Try again later.",
        })
      );
      ws.close();
      console.log("Connection rejected: Game is full");
      return;
    }

    console.log(`Player ${assignedRole} assigned`);

    // Send initial game state and role
    ws.send(
      JSON.stringify({
        type: "playerAssignment",
        data: { playerRole: assignedRole, gameState },
      })
    );

    ws.on("message", (message) => {
      try {
        const parsed = JSON.parse(message);

        if (parsed.type === "makeMove") {
          const index = parsed.data;

          // Validate move
          if (
            gameState.board[index] ||
            gameState.winner ||
            assignedRole !== (gameState.xIsNext ? "X" : "O")
          ) {
            console.warn(`Invalid move by Player ${assignedRole}`);
            return;
          }

          // Update game state
          gameState.board[index] = assignedRole;
          gameState.xIsNext = !gameState.xIsNext;
          gameState.winner = calculateWinner(gameState.board);
          gameState.draw = isBoardFull(gameState.board) && !gameState.winner;

          pubClient.publish("game-moves", JSON.stringify(gameState));
        }

        if (parsed.type === "restartGame") {
          resetGame();
          pubClient.publish("game-moves", JSON.stringify(gameState));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log(`Player ${assignedRole} disconnected`);
      if (players[assignedRole] === ws) {
        players[assignedRole] = null;
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  console.log("WebSocket server initialized");
}

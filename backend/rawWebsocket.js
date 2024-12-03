import { WebSocketServer } from "ws";
import { gameState, calculateWinner, resetGame } from "./gameState.js";

export default function initRawWebSocket(server, pubClient, subClient) {
  const wss = new WebSocketServer({ server });

  // Subscribe to Redis channel for game moves
  subClient.subscribe("game-moves", (message) => {
    try {
      const state = JSON.parse(message);
      Object.assign(gameState, state);

      // Broadcast updated game state to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: "gameState", data: gameState }));
        }
      });
    } catch (error) {
      console.error("Error processing Redis message:", error);
    }
  });

  wss.on("connection", (ws) => {
    console.log("Raw WebSocket client connected");

    // Send current game state to new client
    ws.send(JSON.stringify({ type: "gameState", data: gameState }));

    ws.on("message", (message) => {
      try {
        const parsed = JSON.parse(message);

        if (parsed.type === "makeMove") {
          const index = parsed.data;

          // Validate the move
          if (
            typeof index !== "number" ||
            index < 0 ||
            index >= gameState.board.length ||
            gameState.board[index] ||
            gameState.winner
          ) {
            console.warn("Invalid move received:", parsed);
            return;
          }

          // Update game state
          gameState.board[index] = gameState.xIsNext ? "X" : "O";
          gameState.xIsNext = !gameState.xIsNext;
          gameState.winner = calculateWinner(gameState.board);

          // Publish updated game state to Redis
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
      console.log("Raw WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  console.log("Raw WebSocket initialized");
}

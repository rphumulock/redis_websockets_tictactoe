import { useState, useEffect, useRef } from "react";

export const useGameConnection = () => {
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null,
  });
  const [playerRole, setPlayerRole] = useState(
    localStorage.getItem("playerRole") || null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // Track connection errors

  const socketRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "playerAssignment") {
          const role = message.data.playerRole;
          setPlayerRole(role);
          setGameState(message.data.gameState);

          // Store the assigned role in localStorage
          localStorage.setItem("playerRole", role);
        } else if (message.type === "gameState") {
          setGameState(message.data);
        } else if (message.type === "error") {
          setErrorMessage(message.message);
          console.error("Connection error:", message.message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (type, data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    } else {
      console.error("WebSocket is not open");
    }
  };

  return { gameState, playerRole, isConnected, errorMessage, sendMessage };
};

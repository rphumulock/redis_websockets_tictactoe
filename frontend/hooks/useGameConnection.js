import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

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
  const [errorMessage, setErrorMessage] = useState(null);

  const socketRef = useRef(null);
  const useSocketIO = import.meta.env.VITE_REACT_APP_USE_SOCKET_IO === "true"; // Use env variable

  useEffect(() => {
    if (useSocketIO) {
      // Initialize Socket.IO
      const socket = io("http://localhost:3000", { transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
        console.log("Socket.IO connected");
      });

      socket.on("gameState", (state) => {
        setGameState(state);
      });

      socket.on("playerAssignment", ({ playerRole, gameState }) => {
        setPlayerRole(playerRole);
        setGameState(gameState);
        localStorage.setItem("playerRole", playerRole);
      });

      socket.on("error", (message) => {
        setErrorMessage(message);
        console.error("Socket.IO error:", message);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket.IO disconnected");
      });

      return () => {
        socket.disconnect();
      };
    } else {
      // Initialize WebSocket
      const ws = new WebSocket("ws://localhost:3000");
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "gameState") {
            setGameState(message.data);
          } else if (message.type === "playerAssignment") {
            const { playerRole, gameState } = message.data;
            setPlayerRole(playerRole);
            setGameState(gameState);
            localStorage.setItem("playerRole", playerRole);
          } else if (message.type === "error") {
            setErrorMessage(message.message);
            console.error("WebSocket error:", message.message);
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
    }
  }, [useSocketIO]);

  const sendMessage = (type, data) => {
    if (useSocketIO) {
      socketRef.current?.emit(type, data);
    } else {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type, data }));
      } else {
        console.error("WebSocket is not open");
      }
    }
  };

  return { gameState, playerRole, isConnected, errorMessage, sendMessage };
};

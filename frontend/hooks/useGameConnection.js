import { useState, useEffect, useRef } from "react";
import { SocketIOStrategy } from "../strategies/socketioStrategy";
import { WebSocketStrategy } from "../strategies/websocketStrategy";

const useSocketIO = import.meta.env.VITE_REACT_APP_USE_SOCKET_IO === "true";

export const useGameConnection = () => {
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);

  useEffect(() => {
    console.log("Initializing connection...");

    // Choose the appropriate connection strategy
    const strategy = useSocketIO
      ? new SocketIOStrategy("http://localhost:3000")
      : new WebSocketStrategy("ws://localhost:3000");

    connectionRef.current = strategy;

    // Establish connection and manage lifecycle events
    strategy.connect(
      () => setIsConnected(true), // onConnect
      () => setIsConnected(false), // onDisconnect
      (message) => {
        console.log("Received gameState:", message);
        setGameState(message);
      } // onMessage
    );

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting...");
      strategy.disconnect();
    };
  }, []);

  const sendMessage = (type, data) => {
    const connection = connectionRef.current;
    if (connection) {
      connection.sendMessage(type, data);
    } else {
      console.error("Connection is not initialized");
    }
  };

  return { gameState, isConnected, sendMessage };
};

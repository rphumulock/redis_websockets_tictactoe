import { io } from "socket.io-client";

export class SocketIOStrategy {
  constructor(url) {
    this.socket = io(url, { transports: ["websocket"] });
  }

  connect(onConnect, onDisconnect, onMessage) {
    this.socket.on("connect", () => {
      onConnect();
      console.log("Socket.IO connected");
    });

    this.socket.on("disconnect", () => {
      onDisconnect();
      console.log("Socket.IO disconnected");
    });

    this.socket.on("gameState", (state) => {
      onMessage(state);
    });
  }

  sendMessage(type, data) {
    this.socket.emit(type, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

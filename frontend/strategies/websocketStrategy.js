export class WebSocketStrategy {
  constructor(url) {
    this.socket = new WebSocket(url);
  }

  connect(onConnect, onDisconnect, onMessage) {
    this.socket.onopen = () => {
      onConnect();
      console.log("WebSocket connected");

      // Request initial game state from the server
      this.sendMessage("requestGameState", null);
    };

    this.socket.onclose = () => {
      onDisconnect();
      console.log("WebSocket disconnected");
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "gameState") {
        onMessage(message.data);
      }
    };
  }

  sendMessage(type, data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.error("WebSocket is not open");
    }
  }

  disconnect() {
    if (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    ) {
      this.socket.close();
    }
  }
}

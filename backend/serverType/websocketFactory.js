import initSocketIO from "./socketIO.js";
import initRawWebSocket from "./websocket.js";

export function initWebSocket(type, server, pubClient, subClient) {
  if (type === "socket-io") {
    initSocketIO(server, pubClient, subClient);
  } else if (type === "raw") {
    initRawWebSocket(server, pubClient, subClient);
  } else {
    throw new Error("Invalid WebSocket type");
  }
}

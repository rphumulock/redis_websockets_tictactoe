import http from "http";
import crypto from "crypto";

// Server port
const PORT = 3000;

// Store connected clients
const clients = [];

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(400, { "Content-Type": "text/plain" });
  res.end("WebSocket server only supports WebSocket connections.");
});

// Handle WebSocket upgrade requests
server.on("upgrade", (req, socket) => {
  const secWebSocketKey = req.headers["sec-websocket-key"];
  const acceptKey = generateAcceptKey(secWebSocketKey);

  // Complete WebSocket handshake
  const responseHeaders = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
  ];
  socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");

  // Add the new client to the list of connections
  clients.push(socket);
  console.log("New WebSocket client connected");

  // Handle incoming data and close events
  socket.on("data", (buffer) => {
    const message = parseFrame(buffer);
    if (message) {
      console.log("Received:", message);
      handleMessage(socket, message); // Handle specific message types
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    const index = clients.indexOf(socket);
    if (index !== -1) clients.splice(index, 1);
  });
});

// Generate the Sec-WebSocket-Accept key for handshake
const generateAcceptKey = (key) => {
  return crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");
};

// Parse an incoming WebSocket frame
const parseFrame = (buffer) => {
  const isMasked = buffer[1] & 0x80; // Check if the message is masked
  const payloadLength = buffer[1] & 0x7f; // Get the payload length

  let dataOffset = 2; // Default data offset
  if (payloadLength === 126) dataOffset = 4; // Extended payload length
  if (payloadLength === 127) dataOffset = 10; // Extended 64-bit payload length

  const mask = isMasked ? buffer.slice(dataOffset, dataOffset + 4) : null; // Masking key
  const payload = buffer.slice(dataOffset + (isMasked ? 4 : 0)); // Extract payload

  if (isMasked && mask) {
    // Unmask the payload
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4];
    }
  }

  try {
    return payload.toString(); // Convert payload to a string
  } catch (err) {
    console.error("Error parsing frame:", err);
    return null;
  }
};

// Create a WebSocket frame to send messages
const createFrame = (message) => {
  const payload = Buffer.from(message);
  const payloadLength = payload.length;

  const frame = [0x81]; // FIN and text frame opcode

  if (payloadLength < 126) {
    frame.push(payloadLength);
  } else if (payloadLength < 65536) {
    frame.push(126, (payloadLength >> 8) & 0xff, payloadLength & 0xff);
  } else {
    frame.push(
      127,
      0,
      0,
      0,
      0, // Placeholder for extended payload length
      (payloadLength >> 24) & 0xff,
      (payloadLength >> 16) & 0xff,
      (payloadLength >> 8) & 0xff,
      payloadLength & 0xff
    );
  }

  return Buffer.concat([Buffer.from(frame), payload]);
};

// Handle specific message types
const handleMessage = (socket, message) => {
  try {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case "greet":
        console.log("Greet message received:", parsedMessage.message);
        sendMessage(socket, {
          type: "response",
          message: `Hello! You said: ${parsedMessage.message}`,
        });
        break;

      case "broadcast":
        console.log("Broadcast message received:", parsedMessage.message);
        broadcast(parsedMessage.message);
        break;

      default:
        console.log("Unknown message type:", parsedMessage.type);
        sendMessage(socket, {
          type: "error",
          message: "Unknown message type",
        });
    }
  } catch (error) {
    console.error("Failed to parse message:", error);
  }
};

// Send a message to a single client
const sendMessage = (socket, message) => {
  const frame = createFrame(JSON.stringify(message));
  socket.write(frame);
};

// Broadcast a message to all connected clients
const broadcast = (message) => {
  console.log("Broadcasting:", message);
  const frame = createFrame(message);

  clients.forEach((client) => {
    if (client.writable) {
      client.write(frame);
    }
  });
};

// Start the server
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

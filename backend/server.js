import dotenv from "dotenv";
import express from "express";
import http from "http";
import { createClient } from "redis";
import { initWebSocket } from "./websocketFactory.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const WEB_SOCKET_TYPE = process.argv.includes("--use-socket-io")
  ? "socket-io"
  : "raw";

const app = express();
const server = http.createServer(app);

const pubClient = createClient({ url: REDIS_URL });
const subClient = createClient({ url: REDIS_URL });

(async () => {
  try {
    await pubClient.connect();
    await subClient.connect();
    console.log("Redis clients connected");
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }

  initWebSocket(WEB_SOCKET_TYPE, server, pubClient, subClient);

  app.get("/health", (req, res) => {
    res.json({
      status: "Server is running",
      type: WEB_SOCKET_TYPE,
      time: new Date(),
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();

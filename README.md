# Redis/Websockets Tic Tac Toe

This project is a real-time multiplayer Tic-Tac-Toe game. The backend supports both raw WebSockets and Socket.IO for communication, while the frontend is built with React and styled using TailwindCSS. Redis is used for pub/sub message broadcasting and game state management.

### Project Structure

```
project-root/
├── backend/       # Backend code with WebSocket and Socket.IO support
├── frontend/      # Frontend code with React and TailwindCSS
└── package.json   # Project-wide scripts
```

### Getting Started

**Dependencies:**

- Node.js version 16 or higher
- Docker for Redis

**Installation:**

1. Install all dependencies:

   ```
   npm run install:all
   ```

2. Start Redis using Docker:

   ```
   npm run start:redis
   ```

3. Start the development environment:

   - For Socket.IO:
     ```
     npm run dev:socketio
     ```
   - For Raw WebSockets:
     ```
     npm run dev:raw
     ```

4. Open `http://localhost:5173` in your browser to access the game.

### Scripts Overview

- `install:backend`: Installs backend dependencies.
- `install:frontend`: Installs frontend dependencies.
- `install:all`: Installs both backend and frontend dependencies.
- `start:backend:socketio`: Starts the backend server using Socket.IO.
- `start:backend:raw`: Starts the backend server using raw WebSockets.
- `start:frontend`: Starts the frontend server.
- `start:redis`: Starts the Redis container using Docker.
- `stop:redis`: Stops and removes the Redis container.
- `redis:subscribe`: Subscribes to the Redis channel for debugging.
- `dev:socketio`: Runs the full project with Socket.IO as the backend.
- `dev:raw`: Runs the full project with raw WebSockets as the backend.

### Environment Variables

The `args` passed in should have the following variables:

```
VITE_REACT_APP_USE_SOCKET_IO
```

Change `VITE_REACT_APP_USE_SOCKET_IO` to `false` for raw WebSocket mode.

### Docker Setup for Redis

The project uses Docker to set up Redis. Run `npm run start:redis` to start the Redis container. Use `npm run redis:subscribe` to debug Redis channels.

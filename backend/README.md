# Backend

The backend is responsible for managing game state and player interactions. It supports both raw WebSockets and Socket.IO for communication, with Redis for game state synchronization.

### Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Run the backend server:
   - For Socket.IO:
     ```
     npm run start:socketio
     ```
   - For Raw WebSockets:
     ```
     npm run start:raw
     ```

The backend runs on `http://localhost:3000`.

### Environment Variables

Set up the `.env` file with these variables:

```
REDIS_URL=redis://localhost:6379
PORT=3000
```

### Backend Features

- Real-time updates using WebSocket or Socket.IO.
- Redis Pub/Sub for broadcasting game state.
- Player role assignment and turn-based gameplay.

### Scripts Overview

- `start:socketio`: Start the server using Socket.IO.
- `start:raw`: Start the server using raw WebSockets.
- `redis:subscribe`: Subscribe to Redis channels for debugging.

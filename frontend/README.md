# Frontend

The frontend is a React application styled with TailwindCSS. It connects to the backend via either raw WebSockets or Socket.IO, depending on the configuration.

### Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Run the development server:
   - For Socket.IO:
     ```
     npm run dev
     ```
   - For Raw WebSockets:
     ```
     npm run dev:raw
     ```

Access the game at `http://localhost:5173`.

### Environment Variables

Add the following to the `.env` file in the frontend directory:

```
VITE_REACT_APP_USE_SOCKET_IO=true
```

Change `VITE_REACT_APP_USE_SOCKET_IO` to `false` to use raw WebSockets.

### Frontend Features

- Dynamic connection to either raw WebSockets or Socket.IO.
- Real-time gameplay updates with turn-based logic.
- Styling with TailwindCSS for responsive design.

### Scripts Overview

- `dev`: Starts the frontend server using the default configuration (Socket.IO).
- `dev:raw`: Starts the frontend server for raw WebSocket mode.

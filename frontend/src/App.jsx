import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');
const socket = io('http://localhost:3000', {
  transports: ['websocket'] // Force WebSocket only
});


function App() {
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null
  });

  useEffect(() => {
    socket.on('gameState', (state) => setGameState(state));

    return () => socket.off('gameState');
  }, []);

  const handleClick = (index) => {
    if (gameState.board[index] || gameState.winner) return;
    socket.emit('makeMove', index);
  };

  const renderCell = (index) => (
    <button
      key={index}
      onClick={() => handleClick(index)}
      className="w-20 h-20 border-2 border-gray-300 flex items-center justify-center text-xl font-semibold cursor-pointer"
    >
      {gameState.board[index]}
    </button>
  );

  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Multiplayer Tic-Tac-Toe</h1>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {gameState.board.map((_, i) => renderCell(i))}
      </div>
      {gameState.winner && (
        <div className="mt-4 text-xl text-green-500">
          Winner: {gameState.winner}
        </div>
      )}
      <button
        onClick={() => socket.emit('restartGame')}
        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600"
      >
        Restart Game
      </button>
    </div>
  );
}

export default App;

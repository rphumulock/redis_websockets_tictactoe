import { useGameConnection } from '../hooks/useGameConnection';

function App() {
  const { gameState, sendMessage } = useGameConnection();

  const handleClick = (index) => {
    if (gameState?.board?.[index] || gameState?.winner) return;
    sendMessage('makeMove', index);
  };

  const handleRestart = () => {
    sendMessage('restartGame', null);
  };

  const renderCell = (index) => (
    <button
      key={index}
      onClick={() => handleClick(index)}
      className="w-20 h-20 border-2 border-gray-300 flex items-center justify-center text-xl font-semibold cursor-pointer"
    >
      {gameState?.board?.[index] || ''}
    </button>
  );

  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Multiplayer Tic-Tac-Toe</h1>
      {gameState?.board ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {gameState.board.map((_, i) => renderCell(i))}
        </div>
      ) : (
        <p className="text-red-500">Waiting for game state...</p>
      )}
      {gameState?.winner && (
        <div className="mt-4 text-xl text-green-500">Winner: {gameState.winner}</div>
      )}
      <button
        onClick={handleRestart}
        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600"
      >
        Restart Game
      </button>
    </div>
  );
}

export default App;

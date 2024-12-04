import { useGameConnection } from "../strategies/useGameConnection";

function App() {
  const { gameState, playerRole, isConnected, errorMessage, sendMessage } =
    useGameConnection();

  const handleClick = (index) => {
    if (
      gameState.board[index] ||
      gameState.winner ||
      playerRole !== (gameState.xIsNext ? "X" : "O")
    ) {
      return;
    }
    sendMessage("makeMove", index);
  };

  const handleRestart = () => {
    sendMessage("restartGame", null);
  };

  const renderCell = (index) => {
    const isPlayerTurn = playerRole === (gameState.xIsNext ? "X" : "O");
    let borderColor = "border-gray-300"; // Default border color

    // Determine border color based on the game outcome
    if (gameState.winner) {
      borderColor = !isPlayerTurn ? "border-yellow-500" : "border-red-500" ; // Yellow for winner
    } else if (gameState.draw) {
      borderColor = "border-purple-500"; // Purple for draw
    } else {
      borderColor = isPlayerTurn ? "border-green-500" : "border-gray-300"; // Green for player's turn, red otherwise
    }

    return (
      <button
        key={index}
        onClick={() => handleClick(index)}
        className={`w-20 h-20 ${borderColor} border-4 flex items-center justify-center text-xl font-semibold cursor-pointer`}
      >
        {gameState.board[index] || ""}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Multiplayer Tic-Tac-Toe</h1>

      {!isConnected && <p className="text-red-500">Connecting to server...</p>}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {playerRole && <p className="mb-4">You are Player: {playerRole}</p>}

      {gameState.board ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {gameState.board.map((_, i) => renderCell(i))}
        </div>
      ) : (
        <p className="text-red-500">Waiting for game state...</p>
      )}

      {gameState.winner && (
        <div className="mt-4 text-xl text-green-500">Winner: {gameState.winner}</div>
      )}

      {gameState.draw && (
        <div className="mt-4 text-xl text-blue-500">Draw!</div>
      )}

      {!gameState.winner && !gameState.draw && (
        <div className="mt-4 text-xl text-purple-500">
          Turn: {gameState.xIsNext ? "X" : "O"}
        </div>
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

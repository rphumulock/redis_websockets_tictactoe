export let gameState = {
  board: Array(9).fill(null),
  xIsNext: true,
  winner: null,
};

export function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function resetGame() {
  gameState = {
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null,
  };
}

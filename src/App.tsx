import { useGameStore, getWinningCells, type Cell } from './store/gameStore'
import './App.css'

function CellButton({ index, value }: { index: number; value: Cell }) {
  const { move, winner, board } = useGameStore()
  const winCells = getWinningCells(board)
  const isWin = winCells.includes(index)
  const disabled = !!winner || !!value

  return (
    <button
      className={`cell ${value ?? ''} ${isWin ? 'win' : ''}`}
      onClick={() => move(index)}
      disabled={disabled}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ''}`}
    >
      {value && <span className="symbol">{value}</span>}
    </button>
  )
}

export default function App() {
  const { board, current, winner, scores, reset, resetScores } = useGameStore()

  const status = winner
    ? winner === 'draw'
      ? "It's a Draw!"
      : `Player ${winner} Wins! 🎉`
    : `Player ${current}'s Turn`

  return (
    <div className="app">
      <h1 className="title">Tic Tac Toe</h1>

      <div className="scoreboard">
        <div className={`score-card ${current === 'X' && !winner ? 'active' : ''}`}>
          <span className="player-label x">X</span>
          <span className="score-value">{scores.X}</span>
        </div>
        <div className="score-divider">VS</div>
        <div className={`score-card ${current === 'O' && !winner ? 'active' : ''}`}>
          <span className="player-label o">O</span>
          <span className="score-value">{scores.O}</span>
        </div>
      </div>

      <p className={`status ${winner ? 'winner' : ''}`}>{status}</p>

      <div className="board">
        {board.map((cell, i) => (
          <CellButton key={i} index={i} value={cell} />
        ))}
      </div>

      <div className="actions">
        <button className="btn primary" onClick={reset}>
          New Game
        </button>
        <button className="btn ghost" onClick={resetScores}>
          Reset Scores
        </button>
      </div>
    </div>
  )
}

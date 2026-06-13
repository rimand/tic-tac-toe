import { useGameStore, type Cell } from './store/gameStore'
import './App.css'

function CellButton({
  index,
  value,
  isWin,
  disabled,
  onMove,
}: {
  index: number
  value: Cell
  isWin: boolean
  disabled: boolean
  onMove: (i: number) => void
}) {
  return (
    <button
      className={`cell ${value ?? ''} ${isWin ? 'win' : ''}`}
      onClick={() => onMove(index)}
      disabled={disabled}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ''}`}
    >
      {value && <span className="symbol">{value}</span>}
    </button>
  )
}

export default function App() {
  const { board, current, winner, winLine, scores, reset, resetScores, mode, setMode, aiThinking, move, theme, toggleTheme } =
    useGameStore()

  const winSet = new Set(winLine ?? [])
  const cellDisabled = !!winner || aiThinking

  const statusText =
    winner
      ? winner === 'draw'
        ? "It's a Draw!"
        : mode === 'pvc'
        ? winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖'
        : `Player ${winner} Wins! 🎉`
      : aiThinking
      ? 'AI is thinking...'
      : mode === 'pvc'
      ? current === 'X' ? 'Your Turn (X)' : "AI's Turn (O)"
      : `Player ${current}'s Turn`

  return (
    <div className="app">
      <div className="top-bar">
        <h1 className="title">Tic Tac Toe</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="mode-toggle">
        <button className={`mode-btn ${mode === 'pvc' ? 'active' : ''}`} onClick={() => setMode('pvc')}>
          vs AI 🤖
        </button>
        <button className={`mode-btn ${mode === 'pvp' ? 'active' : ''}`} onClick={() => setMode('pvp')}>
          2 Players 👥
        </button>
      </div>

      <div className="scoreboard">
        <div className={`score-card ${current === 'X' && !winner && !aiThinking ? 'active' : ''}`}>
          <span className="player-label x">X</span>
          <span className="score-sub">{mode === 'pvc' ? 'You' : 'Player 1'}</span>
          <span className="score-value">{scores.X}</span>
        </div>
        <div className="score-divider-col">
          <span className="score-divider">VS</span>
          {scores.draw > 0 && (
            <span className="score-draw">{scores.draw} draw{scores.draw !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className={`score-card ${current === 'O' && !winner && !aiThinking ? 'active' : ''}`}>
          <span className="player-label o">O</span>
          <span className="score-sub">{mode === 'pvc' ? 'AI' : 'Player 2'}</span>
          <span className="score-value">{scores.O}</span>
        </div>
      </div>

      <p className={`status ${winner ? 'winner' : ''} ${aiThinking ? 'thinking' : ''}`}>
        {statusText}
      </p>

      <div className={`board ${aiThinking ? 'board-disabled' : ''}`}>
        {board.map((cell, i) => (
          <CellButton
            key={i}
            index={i}
            value={cell}
            isWin={winSet.has(i)}
            disabled={cellDisabled || !!cell}
            onMove={move}
          />
        ))}
      </div>

      <div className="actions">
        <button className="btn primary" onClick={reset}>New Game</button>
        <button className="btn ghost" onClick={resetScores}>Reset Scores</button>
      </div>
    </div>
  )
}

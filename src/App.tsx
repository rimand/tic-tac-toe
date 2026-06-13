import { useEffect, useState } from 'react'
import { useGameStore, getWinningCells, type Cell } from './store/gameStore'
import './App.css'

function CellButton({ index, value }: { index: number; value: Cell }) {
  const { move, winner, board, aiThinking } = useGameStore()
  const winCells = getWinningCells(board)
  const isWin = winCells.includes(index)
  const disabled = !!winner || !!value || aiThinking

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
  const { board, current, winner, scores, reset, resetScores, mode, setMode, aiThinking } = useGameStore()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const statusText = () => {
    if (winner) {
      if (winner === 'draw') return "It's a Draw!"
      if (mode === 'pvc') return winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖'
      return `Player ${winner} Wins! 🎉`
    }
    if (aiThinking) return 'AI is thinking...'
    if (mode === 'pvc') return current === 'X' ? 'Your Turn (X)' : "AI's Turn (O)"
    return `Player ${current}'s Turn`
  }

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
        <div className="score-divider">VS</div>
        <div className={`score-card ${current === 'O' && !winner ? 'active' : ''}`}>
          <span className="player-label o">O</span>
          <span className="score-sub">{mode === 'pvc' ? 'AI' : 'Player 2'}</span>
          <span className="score-value">{scores.O}</span>
        </div>
      </div>

      <p className={`status ${winner ? 'winner' : ''} ${aiThinking ? 'thinking' : ''}`}>
        {statusText()}
      </p>

      <div className={`board ${aiThinking ? 'board-disabled' : ''}`}>
        {board.map((cell, i) => (
          <CellButton key={i} index={i} value={cell} />
        ))}
      </div>

      <div className="actions">
        <button className="btn primary" onClick={reset}>New Game</button>
        <button className="btn ghost" onClick={resetScores}>Reset Scores</button>
      </div>
    </div>
  )
}

import { create } from 'zustand'

export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]
export type Mode = 'pvp' | 'pvc'
export type Theme = 'dark' | 'light'

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

// Single scan: returns the winning line or null. Used by both winner checks and UI highlighting.
function findWinningLine(board: Board): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line
  }
  return null
}

function checkWinner(board: Board): Player | 'draw' | null {
  const line = findWinningLine(board)
  if (line) return board[line[0]] as Player
  if (board.every(Boolean)) return 'draw'
  return null
}

// Minimax with depth penalty so AI prefers faster wins.
// Mutates board in-place for backtracking (intentional — avoids allocations on a hot 9-cell loop).
function minimax(board: Board, isMaximizing: boolean, depth: number): number {
  const result = checkWinner(board)
  if (result === 'O') return 10 - depth
  if (result === 'X') return -10 + depth
  if (result === 'draw') return 0

  if (isMaximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O'
        best = Math.max(best, minimax(board, false, depth + 1))
        board[i] = null
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X'
        best = Math.min(best, minimax(board, true, depth + 1))
        board[i] = null
      }
    }
    return best
  }
}

function bestMove(board: Board): number {
  let bestVal = -Infinity
  let move = -1
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O'
      const val = minimax(board, false, 0)
      board[i] = null
      if (val > bestVal) { bestVal = val; move = i }
    }
  }
  return move
}

function applyScore(scores: GameState['scores'], winner: Player | 'draw' | null) {
  if (winner === 'draw') scores.draw++
  else if (winner) scores[winner]++
}

function freshGameState() {
  return { board: emptyBoard(), current: 'X' as Player, winner: null, winLine: null, aiThinking: false, aiTimer: null }
}

const emptyBoard = (): Board => Array(9).fill(null)

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

type GameState = {
  board: Board
  current: Player
  winner: Player | 'draw' | null
  winLine: number[] | null
  scores: { X: number; O: number; draw: number }
  mode: Mode
  aiThinking: boolean
  aiTimer: ReturnType<typeof setTimeout> | null
  theme: Theme
}

type GameActions = {
  move: (index: number) => void
  reset: () => void
  resetScores: () => void
  setMode: (mode: Mode) => void
  toggleTheme: () => void
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...freshGameState(),
  scores: { X: 0, O: 0, draw: 0 },
  mode: 'pvc',
  theme: getInitialTheme(),

  move(index) {
    const state = get()
    if (state.winner || state.board[index] || state.aiThinking) return

    const board = [...state.board]
    board[index] = state.current
    const winner = checkWinner(board)
    const winLine = findWinningLine(board)
    const scores = { ...state.scores }
    applyScore(scores, winner)

    const next: Player = state.current === 'X' ? 'O' : 'X'
    set({ board, current: next, winner, winLine, scores, aiTimer: null })

    if (!winner && state.mode === 'pvc' && next === 'O') {
      const timerId = setTimeout(() => {
        const s = get()
        if (s.winner) { set({ aiThinking: false, aiTimer: null }); return }
        const ai = bestMove([...s.board])
        if (ai === -1) { set({ aiThinking: false, aiTimer: null }); return }
        const newBoard = [...s.board]
        newBoard[ai] = 'O'
        const newWinner = checkWinner(newBoard)
        const newWinLine = findWinningLine(newBoard)
        const newScores = { ...s.scores }
        applyScore(newScores, newWinner)
        set({ board: newBoard, current: 'X', winner: newWinner, winLine: newWinLine, scores: newScores, aiThinking: false, aiTimer: null })
      }, 400)
      set({ aiThinking: true, aiTimer: timerId })
    }
  },

  reset() {
    const { aiTimer } = get()
    if (aiTimer) clearTimeout(aiTimer)
    set((s) => ({ ...freshGameState(), scores: s.scores, mode: s.mode, theme: s.theme }))
  },

  resetScores() {
    const { aiTimer } = get()
    if (aiTimer) clearTimeout(aiTimer)
    set((s) => ({ ...freshGameState(), scores: { X: 0, O: 0, draw: 0 }, mode: s.mode, theme: s.theme }))
  },

  setMode(mode) {
    const { aiTimer } = get()
    if (aiTimer) clearTimeout(aiTimer)
    set((s) => ({ ...freshGameState(), scores: s.scores, mode, theme: s.theme }))
  },

  toggleTheme() {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    set({ theme: next })
  },
}))

// Apply initial theme to DOM on load
const initialTheme = getInitialTheme()
document.documentElement.setAttribute('data-theme', initialTheme)

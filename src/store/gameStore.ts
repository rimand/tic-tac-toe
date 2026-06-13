import { create } from 'zustand'

export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]
export type Mode = 'pvp' | 'pvc'

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function checkWinner(board: Board): Player | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player
    }
  }
  if (board.every(Boolean)) return 'draw'
  return null
}

export function getWinningCells(board: Board): number[] {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line
  }
  return []
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

type GameState = {
  board: Board
  current: Player
  winner: Player | 'draw' | null
  scores: { X: number; O: number; draw: number }
  mode: Mode
  aiThinking: boolean
  aiTimer: ReturnType<typeof setTimeout> | null
}

type GameActions = {
  move: (index: number) => void
  reset: () => void
  resetScores: () => void
  setMode: (mode: Mode) => void
}

const emptyBoard = (): Board => Array(9).fill(null)

function cancelTimer(get: () => GameState & GameActions) {
  const { aiTimer } = get()
  if (aiTimer) clearTimeout(aiTimer)
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  board: emptyBoard(),
  current: 'X',
  winner: null,
  scores: { X: 0, O: 0, draw: 0 },
  mode: 'pvc',
  aiThinking: false,
  aiTimer: null,

  move(index) {
    const state = get()
    if (state.winner || state.board[index] || state.aiThinking) return

    const board = [...state.board]
    board[index] = state.current
    const winner = checkWinner(board)
    const scores = { ...state.scores }
    if (winner === 'draw') scores.draw++
    else if (winner) scores[winner]++

    const next: Player = state.current === 'X' ? 'O' : 'X'
    set({ board, current: next, winner, scores, aiTimer: null })

    if (!winner && state.mode === 'pvc' && next === 'O') {
      const timerId = setTimeout(() => {
        const s = get()
        if (s.winner) { set({ aiThinking: false, aiTimer: null }); return }
        const ai = bestMove([...s.board])
        if (ai === -1) { set({ aiThinking: false, aiTimer: null }); return }
        const newBoard = [...s.board]
        newBoard[ai] = 'O'
        const newWinner = checkWinner(newBoard)
        const newScores = { ...s.scores }
        if (newWinner === 'draw') newScores.draw++
        else if (newWinner) newScores[newWinner]++
        set({ board: newBoard, current: 'X', winner: newWinner, scores: newScores, aiThinking: false, aiTimer: null })
      }, 400)
      set({ aiThinking: true, aiTimer: timerId })
    }
  },

  reset() {
    cancelTimer(get)
    set((s) => ({ board: emptyBoard(), current: 'X', winner: null, aiThinking: false, aiTimer: null, scores: s.scores }))
  },

  resetScores() {
    cancelTimer(get)
    set({ board: emptyBoard(), current: 'X', winner: null, aiThinking: false, aiTimer: null, scores: { X: 0, O: 0, draw: 0 } })
  },

  setMode(mode) {
    cancelTimer(get)
    set({ mode, board: emptyBoard(), current: 'X', winner: null, aiThinking: false, aiTimer: null })
  },
}))

import { create } from 'zustand'

export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]

type GameState = {
  board: Board
  current: Player
  winner: Player | 'draw' | null
  scores: Record<Player, number>
  history: Board[]
}

type GameActions = {
  move: (index: number) => void
  reset: () => void
  resetScores: () => void
}

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
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line
    }
  }
  return []
}

const emptyBoard = (): Board => Array(9).fill(null)

export const useGameStore = create<GameState & GameActions>((set) => ({
  board: emptyBoard(),
  current: 'X',
  winner: null,
  scores: { X: 0, O: 0 },
  history: [],

  move(index) {
    set((state) => {
      if (state.winner || state.board[index]) return state
      const board = [...state.board]
      board[index] = state.current
      const winner = checkWinner(board)
      const scores = { ...state.scores }
      if (winner && winner !== 'draw') scores[winner]++
      return {
        board,
        current: state.current === 'X' ? 'O' : 'X',
        winner,
        scores,
        history: [...state.history, board],
      }
    })
  },

  reset() {
    set((state) => ({
      board: emptyBoard(),
      current: 'X',
      winner: null,
      history: [],
      scores: state.scores,
    }))
  },

  resetScores() {
    set({ board: emptyBoard(), current: 'X', winner: null, history: [], scores: { X: 0, O: 0 } })
  },
}))

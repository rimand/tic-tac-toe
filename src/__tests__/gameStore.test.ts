import { describe, it, expect } from 'vitest'
import {
  findWinningLine,
  checkWinner,
  minimax,
  bestMove,
  type Board,
} from '../store/gameStore'

const _ = null

describe('findWinningLine', () => {
  it.each([
    ['row 0', ['X','X','X',_,_,_,_,_,_], [0,1,2]],
    ['row 1', [_,_,_,'X','X','X',_,_,_], [3,4,5]],
    ['row 2', [_,_,_,_,_,_,'O','O','O'], [6,7,8]],
    ['col 0', ['X',_,_,'X',_,_,'X',_,_], [0,3,6]],
    ['col 1', [_,'O',_,_,'O',_,_,'O',_], [1,4,7]],
    ['col 2', [_,_,'X',_,_,'X',_,_,'X'], [2,5,8]],
    ['diag \\', ['O',_,_,_,'O',_,_,_,'O'], [0,4,8]],
    ['diag /', [_,_,'X',_,'X',_,'X',_,_], [2,4,6]],
  ])('%s', (_, board, expected) => {
    expect(findWinningLine(board as Board)).toEqual(expected)
  })

  it('returns null when no winner', () => {
    expect(findWinningLine(['X','O','X','O','X','O','O','X','O'] as Board)).toBeNull()
    expect(findWinningLine(Array(9).fill(null) as Board)).toBeNull()
  })
})

describe('checkWinner', () => {
  it('X wins', () => {
    expect(checkWinner(['X','X','X',_,_,_,_,_,_] as Board)).toBe('X')
  })

  it('O wins', () => {
    expect(checkWinner([_,_,_,'O','O','O',_,_,_] as Board)).toBe('O')
  })

  it('draw — full board no winner', () => {
    expect(checkWinner(['X','O','X','O','X','O','O','X','O'] as Board)).toBe('draw')
  })

  it('ongoing — returns null', () => {
    expect(checkWinner(['X','O',_,_,_,_,_,_,_] as Board)).toBeNull()
    expect(checkWinner(Array(9).fill(null) as Board)).toBeNull()
  })
})

describe('minimax', () => {
  it('O wins immediately — returns positive', () => {
    // O is about to win on index 8
    const board: Board = ['O','O',_,_,_,_,_,_,_]
    board[2] = 'O'
    const score = minimax(['O','O','O',_,_,_,_,_,_] as Board, false, 0)
    expect(score).toBeGreaterThan(0)
  })

  it('X wins immediately — returns negative', () => {
    const score = minimax(['X','X','X',_,_,_,_,_,_] as Board, true, 0)
    expect(score).toBeLessThan(0)
  })

  it('draw board — returns 0', () => {
    const score = minimax(['X','O','X','O','X','O','O','X','O'] as Board, true, 0)
    expect(score).toBe(0)
  })

  it('prefers faster win (depth penalty)', () => {
    // O can win in 1 move vs 2 moves — depth 0 win scores higher
    const fast = minimax(['O','O','O',_,_,_,_,_,_] as Board, false, 0)
    const slow = minimax(['O','O','O',_,_,_,_,_,_] as Board, false, 3)
    expect(fast).toBeGreaterThan(slow)
  })
})

describe('bestMove', () => {
  it('takes winning move immediately', () => {
    // O can win at index 2
    const board: Board = ['O','O',_,_,_,_,_,_,'X']
    expect(bestMove(board)).toBe(2)
  })

  it('blocks X from winning', () => {
    // X would win at index 2 — O must block
    const board: Board = ['X','X',_,_,'O',_,_,_,_]
    expect(bestMove(board)).toBe(2)
  })

  it('plays center on near-empty board', () => {
    const board: Board = ['X',_,_,_,_,_,_,_,_]
    expect(bestMove(board)).toBe(4)
  })

  it('returns -1 on full board', () => {
    expect(bestMove(['X','O','X','O','X','O','O','X','O'] as Board)).toBe(-1)
  })
})

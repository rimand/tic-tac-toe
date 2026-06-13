import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup, within } from '@testing-library/react'
import App from '../App'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false })
  act(() => { useGameStore.getState().resetScores() })
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
})

function getCell(n: number) {
  return screen.getAllByRole('button', { name: /^Cell/i })[n]
}

describe('App render', () => {
  it('renders 9 cells', () => {
    render(<App />)
    expect(screen.getAllByRole('button', { name: /^Cell/i })).toHaveLength(9)
  })

  it('shows title', () => {
    const { container } = render(<App />)
    expect(within(container).getByText('Tic Tac Toe')).toBeInTheDocument()
  })

  it('shows New Game and Reset Scores buttons', () => {
    const { container } = render(<App />)
    expect(within(container).getByRole('button', { name: /new game/i })).toBeInTheDocument()
    expect(within(container).getByRole('button', { name: /reset scores/i })).toBeInTheDocument()
  })
})

describe('PvP game flow', () => {
  beforeEach(() => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /2 players/i })[0])
  })

  it('places X on first click', () => {
    fireEvent.click(getCell(0))
    expect(getCell(0)).toHaveTextContent('X')
  })

  it('alternates X and O', () => {
    fireEvent.click(getCell(0))
    fireEvent.click(getCell(1))
    expect(getCell(0)).toHaveTextContent('X')
    expect(getCell(1)).toHaveTextContent('O')
  })

  it('does not replace filled cell', () => {
    fireEvent.click(getCell(0))
    fireEvent.click(getCell(0))
    expect(getCell(0)).toHaveTextContent('X')
  })

  it('detects X win — row 0', () => {
    fireEvent.click(getCell(0)) // X
    fireEvent.click(getCell(3)) // O
    fireEvent.click(getCell(1)) // X
    fireEvent.click(getCell(4)) // O
    fireEvent.click(getCell(2)) // X wins
    expect(screen.getByText(/Player X Wins/i)).toBeInTheDocument()
  })

  it('detects draw', () => {
    // X O X / O X O / O X O  — draw
    [0, 1, 2, 4, 3, 5, 7, 6, 8].forEach(i => fireEvent.click(getCell(i)))
    expect(screen.getByText(/It's a Draw!/i)).toBeInTheDocument()
  })
})

describe('New Game / Reset Scores', () => {
  beforeEach(() => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /2 players/i })[0])
  })

  it('New Game clears board', () => {
    fireEvent.click(getCell(0))
    fireEvent.click(screen.getByRole('button', { name: /new game/i }))
    expect(getCell(0)).toHaveTextContent('')
  })

  it('Reset Scores clears scores', () => {
    fireEvent.click(getCell(0))
    fireEvent.click(screen.getByRole('button', { name: /reset scores/i }))
    const scores = screen.getAllByText('0')
    expect(scores.length).toBeGreaterThanOrEqual(2)
    expect(getCell(0)).toHaveTextContent('')
  })
})

describe('Theme toggle', () => {
  it('toggles data-theme attribute', () => {
    render(<App />)
    const before = document.documentElement.getAttribute('data-theme')
    fireEvent.click(screen.getByRole('button', { name: /switch to/i }))
    const after = document.documentElement.getAttribute('data-theme')
    expect(before).not.toBe(after)
  })
})

describe('PvC mode', () => {
  it('AI responds after X move', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /vs ai/i })[0])
    fireEvent.click(getCell(4))

    act(() => { vi.advanceTimersByTime(500) })

    const filled = screen.getAllByRole('button', { name: /^Cell/i })
      .filter(b => b.textContent?.trim())
    expect(filled.length).toBeGreaterThanOrEqual(2)
  })
})

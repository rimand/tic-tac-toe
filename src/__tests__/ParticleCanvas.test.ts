import { describe, it, expect, vi, afterEach } from 'vitest'
import { emitBurst, emitCelebration } from '../particles'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('emitBurst', () => {
  it('is callable without throwing', () => {
    expect(() =>
      emitBurst({ x: 100, y: 200, color: '#a78bfa', count: 5 })
    ).not.toThrow()
  })

  it('accepts all options', () => {
    expect(() =>
      emitBurst({ x: 0, y: 0, color: '#fff', count: 50, spread: 10 })
    ).not.toThrow()
  })
})

describe('emitCelebration', () => {
  it('fires without throwing', () => {
    vi.useFakeTimers()
    expect(() => emitCelebration(300, 400)).not.toThrow()
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it('schedules 4 waves via setTimeout', () => {
    vi.useFakeTimers()
    const spy = vi.spyOn(globalThis, 'setTimeout')
    emitCelebration(300, 400)
    expect(spy).toHaveBeenCalledTimes(4)
    vi.runAllTimers()
  })
})

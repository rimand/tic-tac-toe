export type BurstOpts = { x: number; y: number; color: string; count?: number; spread?: number }

export const listeners: Array<(e: BurstOpts) => void> = []

export function emitBurst(opts: BurstOpts) {
  listeners.forEach(fn => fn(opts))
}

export function emitCelebration(cx: number, cy: number) {
  const colors = ['#a78bfa', '#60a5fa', '#fbbf24', '#34d399', '#f472b6', '#fb923c']
  for (let wave = 0; wave < 4; wave++) {
    setTimeout(() => {
      for (let i = 0; i < 18; i++) {
        emitBurst({
          x: cx + (Math.random() - 0.5) * 160,
          y: cy - Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          count: 8,
          spread: 6,
        })
      }
    }, wave * 120)
  }
}

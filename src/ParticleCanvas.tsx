import { useEffect, useRef } from 'react'
import { type BurstOpts, listeners } from './particles'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; decay: number
  size: number; color: string
  shape: 'circle' | 'star' | 'rect'
  spin: number; spinV: number
}

function createParticles(opts: BurstOpts): Particle[] {
  const { x, y, color, count = 22, spread = 4.5 } = opts
  const shapes: Particle['shape'][] = ['circle', 'star', 'rect']
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.2
    const speed = (1.5 + Math.random() * spread) * (0.7 + Math.random() * 0.6)
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1,
      decay: 0.014 + Math.random() * 0.012,
      size: 3 + Math.random() * 5,
      color,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      spin: Math.random() * Math.PI * 2,
      spinV: (Math.random() - 0.5) * 0.3,
    }
  })
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(spin)
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const a2 = a + Math.PI / 5
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    ctx.lineTo(Math.cos(a2) * r * 0.42, Math.sin(a2) * r * 0.42)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, spin: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(spin)
  ctx.fillRect(-s / 2, -s / 3, s, s * 0.6)
  ctx.restore()
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const raf = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onBurst = (opts: BurstOpts) => {
      particles.current.push(...createParticles(opts))
    }
    listeners.push(onBurst)

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter(p => p.life > 0)

      for (const p of particles.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12
        p.vx *= 0.98
        p.spin += p.spinV
        p.life -= p.decay

        const alpha = Math.pow(Math.max(0, p.life), 0.6)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color

        const s = p.size * (0.4 + p.life * 0.6)
        if (p.shape === 'star') drawStar(ctx, p.x, p.y, s, p.spin)
        else if (p.shape === 'rect') drawRect(ctx, p.x, p.y, s * 1.6, p.spin)
        else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, s, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      raf.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf.current)
      const idx = listeners.indexOf(onBurst)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
    />
  )
}

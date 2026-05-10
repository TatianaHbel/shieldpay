import { useEffect, useRef } from 'react'

function seedrand(seed: string) {
  const s = [0, 0, 0, 0]
  for (let i = 0; i < seed.length; i++) {
    s[i % 4] = ((s[i % 4] << 5) - s[i % 4]) + seed.charCodeAt(i)
  }
  return () => {
    const t = s[0] ^ (s[0] << 11)
    s[0] = s[1]; s[1] = s[2]; s[2] = s[3]
    s[3] = (s[3] ^ (s[3] >> 19) ^ t ^ (t >> 8))
    return (s[3] >>> 0) / ((1 << 31) >>> 0)
  }
}

function hsl(rand: () => number) {
  return `hsl(${Math.floor(rand() * 360)},${rand() * 60 + 40}%,${(rand() + rand() + rand() + rand()) * 25}%)`
}

function imageData(size: number, rand: () => number) {
  const half = Math.ceil(size / 2)
  const data: number[] = []
  for (let y = 0; y < size; y++) {
    const row = Array.from({ length: half }, () => Math.floor(rand() * 2.3))
    data.push(...row, ...row.slice(0, size - half).reverse())
  }
  return data
}

interface BlockieProps {
  address: string
  size?: number
  scale?: number
  style?: React.CSSProperties
}

export function Blockie({ address, size = 8, scale = 4, style }: BlockieProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const rand = seedrand(address.toLowerCase())
    const fg = hsl(rand)
    const bg = hsl(rand)
    const spot = hsl(rand)
    const px = imageData(size, rand)
    const w = size * scale
    canvas.width = w; canvas.height = w
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, w)
    px.forEach((v, i) => {
      if (!v) return
      ctx.fillStyle = v === 1 ? fg : spot
      ctx.fillRect((i % size) * scale, Math.floor(i / size) * scale, scale, scale)
    })
  }, [address, size, scale])

  return <canvas ref={ref} width={size * scale} height={size * scale} style={{ borderRadius: '50%', display: 'block', ...style }} />
}

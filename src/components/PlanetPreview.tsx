import { useRef, useEffect } from 'react'
import { getPlanetTexture } from '../utils/planetTextures'

interface PlanetPreviewProps {
  bodyId: string
  size?: number
}

export default function PlanetPreview({ bodyId, size = 120 }: PlanetPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const texture = getPlanetTexture(bodyId)
    if (!texture || !texture.image) {
      // 无纹理时画一个渐变圆
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      gradient.addColorStop(0, '#4ECDC4')
      gradient.addColorStop(1, '#0A1628')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)
      return
    }

    const img = texture.image as HTMLCanvasElement
    canvas.width = size
    canvas.height = size

    ctx.clearRect(0, 0, size, size)

    // 绘制球形裁剪
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
    ctx.clip()

    // 绘制纹理（拉伸填充）
    ctx.drawImage(img, 0, 0, size, size)

    // 添加球面光照效果（左侧暗，右侧亮）
    const lightGrad = ctx.createRadialGradient(
      size * 0.65, size * 0.35, 0,
      size * 0.5, size * 0.5, size * 0.7
    )
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
    lightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
    ctx.fillStyle = lightGrad
    ctx.fillRect(0, 0, size, size)

    ctx.restore()

    // 外发光边框
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.2)'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [bodyId, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  )
}

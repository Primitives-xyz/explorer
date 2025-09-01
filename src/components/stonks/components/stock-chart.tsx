'use client'

import { cn } from '@/utils/utils'
import { useEffect, useRef } from 'react'

interface Props {
  data: number[]
  isPositive: boolean
  mini?: boolean
}

export function StockChart({ data, isPositive, mini = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate points
    const padding = mini ? 2 : 10
    const width = rect.width - padding * 2
    const height = rect.height - padding * 2

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * width,
      y: padding + height - ((value - min) / range) * height,
    }))

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    if (isPositive) {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)')
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
    }

    // Draw filled area
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.lineTo(points[points.length - 1].x, rect.height - padding)
    ctx.lineTo(points[0].x, rect.height - padding)
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.strokeStyle = isPositive ? '#22c55e' : '#ef4444'
    ctx.lineWidth = mini ? 1 : 2
    ctx.stroke()

    // Draw dots on non-mini charts
    if (!mini) {
      points.forEach((point, index) => {
        if (index === 0 || index === points.length - 1) {
          ctx.beginPath()
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI)
          ctx.fillStyle = isPositive ? '#22c55e' : '#ef4444'
          ctx.fill()
        }
      })
    }
  }, [data, isPositive, mini])

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full', mini && 'opacity-80')}
    />
  )
}

'use client'

import { useMotionStore } from '../stores/use-motion-store'
import { BackgroundLinesEffect } from './background-lines-effect'
import { BackgroundPixelsEffect } from './background-pixels-effect'
import { Scanner } from './scanner'

export function ScreenEffects() {
  const { enableMotion } = useMotionStore()

  if (!enableMotion) return null

  return (
    <>
      <BackgroundPixelsEffect />
      <Scanner />
      <BackgroundLinesEffect />
    </>
  )
}

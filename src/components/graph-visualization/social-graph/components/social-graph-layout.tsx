'use client'

import { useWorkerLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2'
import { useEffect } from 'react'

export function SocialGraphLayout() {
  const { start, stop, kill } = useWorkerLayoutForceAtlas2({
    settings: {
      slowDown: 10,
      // adjustSizes: true,
      // barnesHutOptimize: true,
      // strongGravityMode: true,
    },
  })

  useEffect(() => {
    start()

    setTimeout(() => {
      stop()
    }, 10000)

    return () => {
      kill()
    }
  }, [start, stop, kill])

  return null
}

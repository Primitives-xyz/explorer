'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  color?: string
  duration?: number
  delay?: number
  holdDuration?: number
  direction?:
    | 'left-to-right'
    | 'right-to-left'
    | 'top-to-bottom'
    | 'bottom-to-top'
  triggerAnimation?: () => void
}

export function MangaPageTransition({
  color = '#000000',
  duration = 0.8,
  delay = 0,
  holdDuration = 0.1,
  direction = 'left-to-right',
  triggerAnimation,
}: Props) {
  const [animationPhase, setAnimationPhase] = useState<
    'idle' | 'expanding' | 'holding' | 'contracting'
  >('idle')

  useEffect(() => {
    if (triggerAnimation) {
      setAnimationPhase('expanding')
    }
  }, [triggerAnimation])

  const getInitialTransform = () => {
    switch (direction) {
      case 'left-to-right':
        return { scaleX: 0 }
      case 'right-to-left':
        return { scaleX: 0 }
      case 'top-to-bottom':
        return { scaleY: 0 }
      case 'bottom-to-top':
        return { scaleY: 0 }
      default:
        return { scaleX: 0 }
    }
  }

  const getFullCoverageTransform = () => {
    switch (direction) {
      case 'left-to-right':
      case 'right-to-left':
        return { scaleX: 1 }
      case 'top-to-bottom':
      case 'bottom-to-top':
        return { scaleY: 1 }
      default:
        return { scaleX: 1 }
    }
  }

  const getExitTransform = () => {
    switch (direction) {
      case 'left-to-right':
      case 'right-to-left':
        return { scaleX: 0 }
      case 'top-to-bottom':
      case 'bottom-to-top':
        return { scaleY: 0 }
      default:
        return { scaleX: 0 }
    }
  }

  const getTransformOrigin = () => {
    switch (direction) {
      case 'left-to-right':
        return animationPhase === 'contracting' ? 'right center' : 'left center'
      case 'right-to-left':
        return animationPhase === 'contracting' ? 'left center' : 'right center'
      case 'top-to-bottom':
        return animationPhase === 'contracting' ? 'center bottom' : 'center top'
      case 'bottom-to-top':
        return animationPhase === 'contracting' ? 'center top' : 'center bottom'
      default:
        return animationPhase === 'contracting' ? 'right center' : 'left center'
    }
  }

  const getCurrentAnimation = () => {
    switch (animationPhase) {
      case 'expanding':
        return getFullCoverageTransform()
      case 'holding':
        return getFullCoverageTransform()
      case 'contracting':
        return getExitTransform()
      default:
        return getInitialTransform()
    }
  }

  const handleAnimationComplete = () => {
    if (animationPhase === 'expanding') {
      setAnimationPhase('holding')
      setTimeout(() => {
        setAnimationPhase('contracting')
      }, holdDuration * 1000)
    } else if (animationPhase === 'contracting') {
      setAnimationPhase('idle')
    }
  }

  return (
    <AnimatePresence>
      {animationPhase !== 'idle' && (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{
            backgroundColor: color,
            transformOrigin: getTransformOrigin(),
          }}
          initial={getInitialTransform()}
          animate={getCurrentAnimation()}
          transition={{
            duration: animationPhase === 'holding' ? 0 : duration,
            delay: animationPhase === 'expanding' ? delay : 0,
            ease: [0.4, 0, 0.2, 1],
          }}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </AnimatePresence>
  )
}

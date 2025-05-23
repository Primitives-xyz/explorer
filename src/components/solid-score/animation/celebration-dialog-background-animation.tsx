'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export enum ECelebrationDialogBackgroundAnimationPhase {
  IDLE = 'idle',
  EXPANDING = 'expanding',
  HOLDING = 'holding',
  CONTRACTING = 'contracting',
}

interface Props {
  color?: string
  duration?: number
  delay?: number
  phase?: ECelebrationDialogBackgroundAnimationPhase
}

export function CelebrationDialogBackgroundAnimation({
  color = '#000000',
  duration = 0.8,
  delay = 0,
  phase,
}: Props) {
  const [animationPhase, setAnimationPhase] = useState(
    ECelebrationDialogBackgroundAnimationPhase.IDLE
  )

  useEffect(() => {
    if (phase) {
      setAnimationPhase(phase)
    }
  }, [phase])

  const getInitialTransform = () => {
    return {
      scaleX: 0,
    }
  }

  const getFullCoverageTransform = () => {
    return {
      scaleX: 1,
    }
  }

  const getExitTransform = () => {
    return {
      scaleX: 0,
    }
  }

  const getTransformOrigin = () => {
    return animationPhase ===
      ECelebrationDialogBackgroundAnimationPhase.CONTRACTING
      ? 'right center'
      : 'left center'
  }

  const getCurrentAnimation = () => {
    switch (animationPhase) {
      case ECelebrationDialogBackgroundAnimationPhase.EXPANDING:
        return getFullCoverageTransform()
      case ECelebrationDialogBackgroundAnimationPhase.HOLDING:
        return getFullCoverageTransform()
      case ECelebrationDialogBackgroundAnimationPhase.CONTRACTING:
        return getExitTransform()
      default:
        return getInitialTransform()
    }
  }

  const handleAnimationComplete = () => {
    if (
      animationPhase === ECelebrationDialogBackgroundAnimationPhase.EXPANDING
    ) {
      setAnimationPhase(ECelebrationDialogBackgroundAnimationPhase.HOLDING)
    } else if (
      animationPhase === ECelebrationDialogBackgroundAnimationPhase.CONTRACTING
    ) {
      setAnimationPhase(ECelebrationDialogBackgroundAnimationPhase.IDLE)
    }
  }

  return (
    <AnimatePresence>
      {animationPhase !== ECelebrationDialogBackgroundAnimationPhase.IDLE && (
        <motion.div
          // className="fixed inset-0 z-[9998] pointer-events-none"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: color,
            transformOrigin: getTransformOrigin(),
          }}
          initial={getInitialTransform()}
          animate={getCurrentAnimation()}
          transition={{
            duration:
              animationPhase ===
              ECelebrationDialogBackgroundAnimationPhase.HOLDING
                ? 0
                : duration,
            delay:
              animationPhase ===
              ECelebrationDialogBackgroundAnimationPhase.EXPANDING
                ? delay
                : 0,
            ease: [0.4, 0, 0.2, 1],
          }}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </AnimatePresence>
  )
}

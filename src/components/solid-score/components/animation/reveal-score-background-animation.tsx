'use client'

import { cn } from '@/utils/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export enum ERevealScoreBackgroundAnimationPhase {
  IDLE = 'idle',
  EXPANDING = 'expanding',
  HOLDING = 'holding',
  CONTRACTING = 'contracting',
}

interface Props {
  duration?: number
  delay?: number
  phase?: ERevealScoreBackgroundAnimationPhase
  className?: string
}

export function RevealScoreBackgroundAnimation({
  duration = 0.4,
  delay = 0,
  phase,
  className,
}: Props) {
  const [animationPhase, setAnimationPhase] = useState(
    ERevealScoreBackgroundAnimationPhase.IDLE
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
    return animationPhase === ERevealScoreBackgroundAnimationPhase.CONTRACTING
      ? 'right center'
      : 'left center'
  }

  const getCurrentAnimation = () => {
    switch (animationPhase) {
      case ERevealScoreBackgroundAnimationPhase.EXPANDING:
        return getFullCoverageTransform()
      case ERevealScoreBackgroundAnimationPhase.HOLDING:
        return getFullCoverageTransform()
      case ERevealScoreBackgroundAnimationPhase.CONTRACTING:
        return getExitTransform()
      default:
        return getInitialTransform()
    }
  }

  const handleAnimationComplete = () => {
    if (animationPhase === ERevealScoreBackgroundAnimationPhase.EXPANDING) {
      setAnimationPhase(ERevealScoreBackgroundAnimationPhase.HOLDING)
    } else if (
      animationPhase === ERevealScoreBackgroundAnimationPhase.CONTRACTING
    ) {
      setAnimationPhase(ERevealScoreBackgroundAnimationPhase.IDLE)
    }
  }

  return (
    <AnimatePresence>
      {animationPhase !== ERevealScoreBackgroundAnimationPhase.IDLE && (
        <motion.div
          className={cn(
            'absolute w-[110%] h-full left-1/2 -translate-x-1/2 pointer-events-none',
            className
          )}
          style={{
            transformOrigin: getTransformOrigin(),
          }}
          initial={getInitialTransform()}
          animate={getCurrentAnimation()}
          transition={{
            duration,
            delay:
              animationPhase === ERevealScoreBackgroundAnimationPhase.EXPANDING
                ? delay
                : 0,
            // delay,
            ease: [0.4, 0, 0.2, 1],
          }}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </AnimatePresence>
  )
}

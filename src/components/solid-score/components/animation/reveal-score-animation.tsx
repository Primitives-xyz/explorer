'use client'

import {
  Animate,
  Button,
  ButtonSize,
  Dialog,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSolidScoreStore } from '../../stores/use-solid-score-store'
import {
  ERevealScoreBackgroundAnimationPhase,
  RevealScoreBackgroundAnimation,
} from './reveal-score-background-animation'
import { RevealScoreText } from './reveal-score-text'

export function RevealScoreAnimation() {
  const { openRevealScoreAnimation, setOpenRevealScoreAnimation } =
    useSolidScoreStore()
  const { mainProfile } = useCurrentWallet()
  const [animationOpen, setAnimationOpen] = useState(false)

  useEffect(() => {
    if (openRevealScoreAnimation) {
      setAnimationOpen(true)
    }
  }, [openRevealScoreAnimation])

  const getPhase = () => {
    if (animationOpen) {
      return ERevealScoreBackgroundAnimationPhase.EXPANDING
    }
    return ERevealScoreBackgroundAnimationPhase.CONTRACTING
  }

  const closeModal = () => {
    setAnimationOpen(false)

    setTimeout(() => {
      setOpenRevealScoreAnimation(false)
    }, 800)
  }

  if (!mainProfile) {
    return null
  }

  return (
    <Dialog
      open={openRevealScoreAnimation}
      onOpenChange={setOpenRevealScoreAnimation}
    >
      <DialogPortal>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <Animate isVisible={animationOpen}>
            <DialogOverlay className="z-0" />
          </Animate>
          <div className="relative w-full h-[70vh] -rotate-3 flex flex-col items-center justify-center">
            <RevealScoreBackgroundAnimation
              phase={getPhase()}
              color="#272626"
              className="top-[-10%]"
            />
            <RevealScoreBackgroundAnimation
              phase={getPhase()}
              color="#171717"
              delay={0.2}
              className="top-[5%]"
            />
            <RevealScoreBackgroundAnimation
              phase={getPhase()}
              color="#8cdc7a"
              delay={0.4}
            />
            <RevealScoreText
              open={animationOpen}
              closeModal={closeModal}
              profileId={mainProfile.id}
            />
            <Animate
              isVisible={animationOpen}
              className="absolute top-5 right-5"
              animate={{
                opacity: 1,
                transition: {
                  delay: 0.7,
                },
              }}
            >
              <Button
                className="bg-black/80 hover:bg-black/90 text-primary rounded-full"
                size={ButtonSize.ICON}
                onClick={closeModal}
              >
                <XIcon />
              </Button>
            </Animate>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  )
}

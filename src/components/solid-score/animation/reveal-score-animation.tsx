import {
  Animate,
  Button,
  ButtonSize,
  Dialog,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import {
  ERevealScoreBackgroundAnimationPhase,
  RevealScoreBackgroundAnimation,
} from './reveal-score-background-animation'
import { RevealScoreText } from './reveal-score-text'

export function RevealScoreAnimation() {
  const [open, setOpen] = useState(false)
  const [animationOpen, setAnimationOpen] = useState(false)

  const handleClick = () => {
    setOpen(true)
    setAnimationOpen(true)
  }

  const getPhase = () => {
    if (animationOpen) {
      return ERevealScoreBackgroundAnimationPhase.EXPANDING
    }
    return ERevealScoreBackgroundAnimationPhase.CONTRACTING
  }

  const closeModal = () => {
    setAnimationOpen(false)

    setTimeout(() => {
      setOpen(false)
    }, 800)
  }

  return (
    <div>
      <Button onClick={handleClick} className="mb-5">
        Trigger Animation
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
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
                color="#fff700"
                delay={0.4}
              />
              <RevealScoreText open={animationOpen} closeModal={closeModal} />
              <Animate
                isVisible={animationOpen}
                className="absolute top-5 right-5"
              >
                <Button
                  className="bg-black/70 hover:bg-black/80 text-white rounded-full"
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
    </div>
  )
}

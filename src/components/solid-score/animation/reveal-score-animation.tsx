import {
  Animate,
  Button,
  ButtonSize,
  Dialog,
  DialogPortal,
} from '@/components/ui'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import {
  CelebrationDialogBackgroundAnimation,
  ECelebrationDialogBackgroundAnimationPhase,
} from './celebration-dialog-background-animation'
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
      return ECelebrationDialogBackgroundAnimationPhase.EXPANDING
    }
    return ECelebrationDialogBackgroundAnimationPhase.CONTRACTING
  }

  const onClickClose = () => {
    setAnimationOpen(false)

    setTimeout(() => {
      setOpen(false)
    }, 1000)
  }

  return (
    <div>
      <Button onClick={handleClick} className="mb-5">
        Trigger Animation
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center">
            <CelebrationDialogBackgroundAnimation
              phase={getPhase()}
              color="#F0E68C"
              duration={0.3}
            />
            <CelebrationDialogBackgroundAnimation
              phase={getPhase()}
              color="#E8D574"
              delay={0.2}
              duration={0.4}
            />
            <CelebrationDialogBackgroundAnimation
              phase={getPhase()}
              color="#fff700"
              delay={0.4}
              duration={0.4}
            />
            <RevealScoreText open={animationOpen} />
            <Animate
              isVisible={animationOpen}
              className="absolute top-5 right-5"
            >
              <Button
                className="bg-black/70 hover:bg-black/80 text-white rounded-full"
                size={ButtonSize.ICON}
                onClick={onClickClose}
              >
                <XIcon />
              </Button>
            </Animate>
          </div>
        </DialogPortal>
      </Dialog>
    </div>
  )
}

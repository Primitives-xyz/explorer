import { Animate, Button, ButtonSize } from '@/components/ui'
import { ArrowRightIcon } from 'lucide-react'

interface Props {
  open: boolean
  closeModal: () => void
}

export function RevealScoreText({ open, closeModal }: Props) {
  return (
    <Animate
      isVisible={open}
      initial={{
        opacity: 0,
        x: -80,
      }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.4,
          delay: 0.7,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }}
      exit={{
        opacity: 0,
        x: 50,
      }}
      className="flex flex-col items-center justify-center relative"
    >
      <div className="flex flex-col justify-center items-start gap-2">
        <div className="text-black/60 text-6xl font-semibold">
          Solid Score Unlocked!
        </div>
        <div className="text-black/80 text-9xl font-bold">2,000</div>
        <Button
          size={ButtonSize.LG}
          className="bg-black/80 hover:bg-black/90 text-white mt-5"
          onClick={closeModal}
        >
          Go To Leaderboard <ArrowRightIcon />
        </Button>
      </div>
    </Animate>
  )
}

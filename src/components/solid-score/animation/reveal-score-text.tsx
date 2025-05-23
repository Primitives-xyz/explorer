import { Animate, Button, ButtonSize } from '@/components/ui'
import { ArrowRightIcon } from '@dynamic-labs/sdk-react-core'
import { AnimationProps, motion } from 'framer-motion'

interface Props {
  open: boolean
  closeModal: () => void
}

export function RevealScoreText({ open, closeModal }: Props) {
  const containerAnimationVariants: AnimationProps['variants'] = {
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.6,
      },
    },
  }

  const itemAnimationVariants: AnimationProps['variants'] = {
    hidden: {
      opacity: 0,
      x: -80,
    },
    visible: {
      opacity: 1,
      x: 0,
      // transition: {
      //   type: 'spring',
      //   stiffness: 200,
      //   damping: 10,
      // },
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
    exit: {
      opacity: 0,
      x: 50,
    },
  }

  return (
    <Animate
      isVisible={open}
      // initial={{
      //   opacity: 0,
      //   x: -80,
      // }}
      // animate={{
      //   opacity: 1,
      //   x: 0,
      //   transition: {
      //     duration: 0.4,
      //     delay: 0.7,
      //     ease: [0.34, 1.56, 0.64, 1],
      //   },
      // }}
      // exit={{
      //   opacity: 0,
      //   x: 50,
      // }}
      variants={containerAnimationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-start justify-center gap-2 relative"
    >
      <motion.div variants={itemAnimationVariants}>
        <div className="text-black/60 text-6xl font-semibold">
          Solid Score Unlocked!
        </div>
      </motion.div>
      <motion.div variants={itemAnimationVariants}>
        <div className="text-black/80 text-9xl font-bold">2,000</div>
      </motion.div>
      <motion.div variants={itemAnimationVariants}>
        <Button
          size={ButtonSize.LG}
          className="bg-black/80 hover:bg-black/90 text-white mt-5"
          onClick={closeModal}
        >
          Go To Leaderboard <ArrowRightIcon />
        </Button>
      </motion.div>
    </Animate>
  )
}

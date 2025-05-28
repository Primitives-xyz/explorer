import { Animate, Button, ButtonSize, Spinner } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { ArrowRightIcon } from '@dynamic-labs/sdk-react-core'
import { AnimationProps, motion } from 'framer-motion'
import { useSolidScore } from '../../hooks/use-solid-score'

interface Props {
  open: boolean
  closeModal: () => void
  profileId: string
}

export function RevealScoreText({ open, closeModal, profileId }: Props) {
  const { data, loading } = useSolidScore({ profileId: profileId })
  const solidScore = formatSmartNumber(data?.score || '0', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

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
      variants={containerAnimationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-start justify-center gap-2 relative"
    >
      <motion.div variants={itemAnimationVariants}>
        <div className="text-black/90 text-6xl font-semibold">
          SOLID Score Unlocked!
        </div>
      </motion.div>
      <motion.div variants={itemAnimationVariants}>
        <div className="text-black/90 text-9xl font-bold">
          {loading ? <Spinner /> : solidScore}
        </div>
      </motion.div>
      <motion.div variants={itemAnimationVariants}>
        <Button
          size={ButtonSize.LG}
          className="bg-black/90 hover:bg-black/95 text-primary mt-5"
          onClick={closeModal}
          href={route('leaderboard')}
        >
          Go To Leaderboard <ArrowRightIcon />
        </Button>
      </motion.div>
    </Animate>
  )
}

'use client'

import { Swap } from '@/components-new-version/swap/components/swap'
import { Button, ButtonVariant } from '@/components-new-version/ui'
import { cn } from '@/components-new-version/utils/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  showSwap: boolean
  setOpenSwap: (prev: boolean) => void
}

export function RightSideHome({ showSwap, setOpenSwap }: Props) {
  return (
    <div className="relative">
      <Button
        className={cn(
          {
            'absolute top-[90%] -left-13': showSwap,
            'fixed top-3/4 -right-4': !showSwap,
          },
          'z-50 rotate-270 !rounded-b-none font-bold transition-none'
        )}
        onClick={() => setOpenSwap(!showSwap)}
        variant={showSwap ? ButtonVariant.SECONDARY : ButtonVariant.DEFAULT}
      >
        {showSwap ? 'Close' : 'Swap'}
      </Button>

      <AnimatePresence>
        {showSwap && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Swap />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

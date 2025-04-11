'use client'

import { Button, ButtonVariant } from '@/components-new-version/ui'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { Swap } from './swap'

export function SwapTray() {
  const { open, setOpen } = useSwapStore()
  const [displaySwap, setDisplaySwap] = useState(false)

  useEffect(() => {
    if (open) {
      setDisplaySwap(true)
    } else {
      const timeout = setTimeout(() => {
        setDisplaySwap(false)
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [open])

  return (
    <motion.div
      initial={{
        x: '100%',
      }}
      animate={{
        x: open ? 0 : '100%',
      }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="fixed top-0 right-0 bottom-0 z-50 h-screen"
    >
      <div className="pt-topbar relative h-full">
        <Button
          className="w-[100px] absolute top-20 left-0 -translate-x-full -rotate-90 rounded-b-none origin-bottom-right"
          variant={open ? ButtonVariant.OUTLINE : ButtonVariant.DEFAULT}
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Swap' : 'Swap'}
        </Button>
        {displaySwap && (
          <div className="h-full pr-6 py-5 w-[330px] overflow-y-auto">
            <Swap />
          </div>
        )}
      </div>
    </motion.div>
  )
}

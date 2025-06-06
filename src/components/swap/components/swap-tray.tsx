'use client'

import { Swap } from '@/components/swap/components/swap'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { Button, ButtonVariant } from '@/components/ui'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  isAlwaysOpen?: boolean
}

export function SwapTray({ isAlwaysOpen = false }: Props) {
  const { open, setOpen } = useSwapStore()
  const [displaySwap, setDisplaySwap] = useState(false)
  const pathname = usePathname()

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

  useEffect(() => {
    setOpen(isAlwaysOpen)
  }, [pathname, isAlwaysOpen, setOpen])

  return (
    <motion.div
      initial={{
        x: 'calc(100% - 1.5rem)',
      }}
      animate={{
        x: open ? 0 : 'calc(100% - 1.5rem)',
      }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="fixed top-0 right-0 bottom-0 z-50 h-screen hidden md:block"
    >
      {displaySwap && !isAlwaysOpen && (
        <div className="absolute top-topbar right-0 inset-y-0 w-[calc(100%+40px)] fade-out-text--left backdrop-blur-xl" />
      )}
      <div className="pt-topbar relative h-full z-50">
        {!isAlwaysOpen && (
          <Button
            className="w-[100px] absolute top-20 left-6 -translate-x-full -rotate-90 rounded-b-none origin-bottom-right"
            variant={open ? ButtonVariant.OUTLINE : ButtonVariant.DEFAULT}
            onClick={() => setOpen(!open)}
            disableHoverFeedback
          >
            {open ? 'Close Swap' : 'Swap'}
          </Button>
        )}
        {displaySwap && (
          <div className="h-full px-6 py-5 w-[350px] overflow-y-auto">
            <Swap />
          </div>
        )}
      </div>
    </motion.div>
  )
}

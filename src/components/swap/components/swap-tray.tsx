'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { Swap } from './swap'

export function SwapTray() {
  const { open, setOpen } = useSwapStore()
  const [displaySwap, setDisplaySwap] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/') {
      setOpen(true)
    }
  }, [pathname, setOpen])

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
    if (pathname !== '/') {
      setOpen(false)
    }
  }, [pathname, setOpen])

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
      {displaySwap && (
        <div className="absolute top-topbar right-0 inset-y-0 w-[calc(100%+70px)] fade-out-text--left backdrop-blur-xl" />
      )}
      <div className="pt-topbar relative h-full z-50">
        {displaySwap && (
          <div className="h-full pr-6 py-5 w-[330px] overflow-y-auto">
            <Swap />
          </div>
        )}
      </div>
    </motion.div>
  )
}

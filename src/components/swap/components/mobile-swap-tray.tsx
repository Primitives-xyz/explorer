import { motion, useAnimation, useMotionValue } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { Swap } from './swap'

interface Props {
  isAlwaysOpen?: boolean
}

const FIXED_TRAY_HEIGHT = 450

export function MobileSwapTray({ isAlwaysOpen = false }: Props) {
  const { open, setOpen } = useSwapStore()
  const [displaySwap, setDisplaySwap] = useState(false)
  const pathname = usePathname()
  const y = useMotionValue(0)
  const controls = useAnimation()
  const dragThreshold = 60
  const trayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setDisplaySwap(true)
      controls.set({ y: FIXED_TRAY_HEIGHT })
      controls.start({ y: 0 })
    } else {
      controls.start({ y: FIXED_TRAY_HEIGHT }).then(() => setDisplaySwap(false))
    }
  }, [open, controls])

  useEffect(() => {
    setOpen(isAlwaysOpen)
  }, [pathname, isAlwaysOpen, setOpen])

  return (
    <>
      {displaySwap && !isAlwaysOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}
      <motion.div
        ref={trayRef}
        initial={false}
        animate={controls}
        style={{ y, height: FIXED_TRAY_HEIGHT }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={1}
        onDragEnd={(_, info) => {
          if (info.offset.y > dragThreshold) {
            setOpen(false)
          } else {
            controls.start({ y: 0 })
          }
        }}
        className="fixed left-0 right-0 bottom-0 px-2 z-50 rounded backdrop-blur-xl md:hidden touch-pan-y"
      >
        {/* Grabbable bar */}
        <div className="mx-auto mt-2 mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/40" />
        {displaySwap && (
          <div className="h-full overflow-y-auto bg-background/80">
            <Swap autoFocus={false} />
          </div>
        )}
      </motion.div>
    </>
  )
}

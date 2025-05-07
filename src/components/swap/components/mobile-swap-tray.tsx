import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useAnimation } from 'framer-motion'
import { useSwapStore } from '../stores/use-swap-store'
import { Swap } from './swap'
import { usePathname } from 'next/navigation'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="fixed left-0 right-0 bottom-0 z-50 bg-black bg-card border border-foreground text-card-foreground shadow-card rounded-t-2xl backdrop-blur-xl md:hidden touch-pan-y"
      >
        <div className="flex justify-center py-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="relative h-full px-4 py-2">
          {displaySwap && (
            <div className="h-full overflow-y-auto bg-background/80">
              <Swap autoFocus={false} />
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
} 
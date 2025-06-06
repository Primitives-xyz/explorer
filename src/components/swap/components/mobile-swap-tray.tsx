import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { Swap } from './swap'

interface Props {
  isAlwaysOpen?: boolean
}

const FIXED_TRAY_HEIGHT = 450
const DRAG_THRESHOLD = 60

export function MobileSwapTray({ isAlwaysOpen = false }: Props) {
  const { open, setOpen, isNestedModal } = useSwapStore()
  const [displaySwap, setDisplaySwap] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const trayRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)

  // Determine z-index based on whether it's nested
  const backdropZIndex = isNestedModal ? 'z-[70]' : 'z-40'
  const trayZIndex = isNestedModal ? 'z-[80]' : 'z-50'

  useEffect(() => {
    if (open) {
      setDisplaySwap(true)
      setDragY(0)
    } else {
      // Wait for animation to complete before hiding content
      const timer = setTimeout(() => {
        setDisplaySwap(false)
        setDragY(0)
      }, 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [open])

  // Only force open if isAlwaysOpen is true
  useEffect(() => {
    if (isAlwaysOpen && !open) {
      setOpen(true)
    }
  }, [isAlwaysOpen, open, setOpen])

  // Close handler
  const handleClose = () => {
    // Don't allow closing if it should always be open
    if (!isAlwaysOpen) {
      setOpen(false)
    }
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAlwaysOpen) return

    const touch = e.touches[0]
    startYRef.current = touch.clientY
    currentYRef.current = 0
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAlwaysOpen) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startYRef.current

    // Only allow dragging down
    if (deltaY > 0) {
      currentYRef.current = deltaY
      setDragY(deltaY)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || isAlwaysOpen) return

    setIsDragging(false)

    // Check if dragged far enough to close
    if (currentYRef.current > DRAG_THRESHOLD) {
      handleClose()
    } else {
      // Snap back to open position
      setDragY(0)
    }
  }

  // Calculate styles
  const trayStyle: React.CSSProperties = {
    transform: open
      ? `translateY(${dragY}px)`
      : `translateY(${FIXED_TRAY_HEIGHT}px)`,
    transition: isDragging
      ? 'none'
      : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    height: `${FIXED_TRAY_HEIGHT}px`,
  }

  return (
    <>
      {/* Backdrop - show whenever tray is open */}
      {open && !isAlwaysOpen && (
        <div
          className={`fixed inset-0 ${backdropZIndex} bg-black/50 transition-opacity duration-300`}
          style={{ opacity: open ? 1 : 0 }}
          onClick={handleClose}
        />
      )}

      <div
        ref={trayRef}
        className={`fixed left-0 right-0 bottom-0 px-2 ${trayZIndex} rounded backdrop-blur-xl md:hidden touch-none`}
        style={trayStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header with grabbable bar and close button */}
        <div className="flex items-center justify-between pt-2 pb-3">
          {/* Empty div for spacing */}
          <div className="w-8" />

          {/* Grabbable bar */}
          <div
            className="h-1.5 w-12 rounded-full bg-muted-foreground/40 cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          />

          {/* Close button as fallback - only show if not always open */}
          {!isAlwaysOpen && (
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close swap"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {isAlwaysOpen && <div className="w-8" />}
        </div>

        {/* Swap content */}
        {displaySwap && (
          <div className="h-full overflow-y-auto bg-background/80">
            <Swap autoFocus={false} />
          </div>
        )}
      </div>
    </>
  )
}

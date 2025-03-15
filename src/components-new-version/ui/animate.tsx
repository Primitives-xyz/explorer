'use client'

import { AnimatePresence, motion, MotionProps } from 'framer-motion'

interface Props extends MotionProps {
  isVisible: boolean
  className?: string
}

export function Animate({ isVisible, className, ...props }: Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={className}
          {...props}
        />
      )}
    </AnimatePresence>
  )
}

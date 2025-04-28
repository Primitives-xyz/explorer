'use client'

import { Animate, Card, CardProps } from '@/components/ui'
import { cn } from '@/utils/utils'
import { motion } from 'framer-motion'
import React from 'react'
import { LoadingCard } from './loading-card'

interface MotionCardBackupProps extends CardProps {
  loading?: boolean
}

export const MotionCardBackup = React.forwardRef<HTMLDivElement, MotionCardBackupProps>(
  ({ loading = true, ...props }, ref) => {
    const animate = {
      opacity: 1,
      scale: 1,
    }

    return (
      <div className="relative">
        <Animate isVisible={loading}>
          <LoadingCard />
        </Animate>
        <motion.div
          className={cn({
            'pointer-events-none': loading,
          })}
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={loading ? {} : animate}
          transition={{ duration: 0.3 }}
        >
          <Card {...props} ref={ref} />
        </motion.div>
      </div>
    )
  }
)

MotionCardBackup.displayName = 'MotionCardBackup'

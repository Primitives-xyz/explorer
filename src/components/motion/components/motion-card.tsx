'use client'

import { Animate, Card, CardProps } from '@/components/ui'
import { cn } from '@/utils/utils'
import React, { useEffect, useState } from 'react'
import { LoadingCard } from './loading-card'

// interface Props {
//   content: React.ReactNode
// }

// export function MotionCard({ content }: Props) {
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     setLoading(true)

//     setTimeout(() => {
//       setLoading(false)
//     }, 4000)
//   }, [])

// return (
//   <div className="relative">
//     <Animate isVisible={loading}>
//       <LoadingCard />
//     </Animate>
//     <Card
//       className={cn('transition-opacity duration-300', {
//         'opacity-0 pointer-events-none': loading,
//       })}
//     >
//       <CardContent>{content}</CardContent>
//     </Card>
//   </div>
// )
// }

export const MotionCard = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      setTimeout(() => {
        setLoading(false)
      }, 4000)
    }, [])

    return (
      <div className="relative">
        <Animate isVisible={loading}>
          <LoadingCard />
        </Animate>
        <Card
          className={cn('transition-opacity duration-300', {
            'opacity-0 pointer-events-none': loading,
          })}
          {...props}
          ref={ref}
        />
      </div>
    )
  }
)

MotionCard.displayName = 'MotionCard'

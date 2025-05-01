import { Badge, badgeVariants } from '@/components/ui/badge'
import { useState } from 'react'

export function TokenBadge({ icon, tooltip, variant = 'default' }: { icon: React.ReactNode, tooltip: string, variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) {
  const [hover, setHover] = useState(false)
  return (
    <div className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Badge variant={variant}>
        <span className="mr-1">{icon}</span>
      </Badge>
      {hover && (
        <div className="absolute left-1/2 z-50 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap shadow-lg">
          {tooltip}
        </div>
      )}
    </div>
  )
} 
'use client'

import { useIsMobile } from '@/utils/use-is-mobile'
import { cn } from '@/utils/utils'

interface GraphProps {
  id: string
}

export function Graph({ id }: GraphProps) {
  const { isMobile } = useIsMobile()
  const src = `https://birdeye.so/tv-widget/${id}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark&defaultMetric=mcap`

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-card bg-card',
        isMobile ? 'h-[300px]' : 'h-[430px]'
      )}
    >
      <iframe
        src={src}
        title="Token Graph"
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
        className="rounded-lg border-0"
      />
    </div>
  )
}

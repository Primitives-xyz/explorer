'use client'

import { Button } from '@/components/ui'
import { cn, formatTimeAgo } from '@/utils/utils'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { IActivityTapeEntry } from '../activity-tape.models'

interface Props {
  activity: IActivityTapeEntry
}

export function ActivityTapeEntry({ activity }: Props) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null)

  useEffect(() => {
    setTimeAgo(formatTimeAgo(new Date(activity.timestamp)))
  }, [activity.timestamp])

  return (
    <Button
      isInvisible
      disabled={!activity.signature}
      href={activity.signature ? `/${activity.signature}` : '#'}
      className="opacity-100!"
    >
      <div className="inline-flex items-center gap-2 text-xs bg-card rounded-lg px-4 py-1">
        <span className="bg-background py-1 px-1.5 rounded">
          {activity.action}
        </span>
        <span>{activity.text}</span>
        {activity.amount && (
          <span
            className={cn(
              {
                'text-primary': activity.highlight === 'positive',
                'text-destructive': activity.highlight === 'negative',
              },
              'font-bold flex items-center gap-1'
            )}
          >
            <p>{activity.amount}</p>
            <p>{activity.amountSuffix}</p>
            {activity.isSSEBuy && (
              <Image
                src="/images/sse.png"
                alt="SSE"
                width={16}
                height={16}
                className="rounded-sm"
              />
            )}
          </span>
        )}
        <span>•</span>
        {timeAgo && <span>{timeAgo}</span>}
      </div>
    </Button>
  )
}

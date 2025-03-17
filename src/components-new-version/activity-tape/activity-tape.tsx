'use client'

import { useActivityTape } from '@/components-new-version/activity-tape/hooks/use-activity-tape'
import { cn } from '@/components-new-version/utils/utils'
import Image from 'next/image'
import Link from 'next/link'

export function ActivityTape() {
  const { allActivities, contentRef, formatTimeAgo, setIsPaused } =
    useActivityTape()

  return (
    <div className="flex items-center">
      <div
        className="flex-1 overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div ref={contentRef} className="flex gap-3 whitespace-nowrap">
          {allActivities.map((activity, i) => (
            <Link
              key={i}
              href={activity.signature ? `/${activity.signature}` : '#'}
              className={
                activity.signature ? 'cursor-pointer' : 'cursor-default'
              }
            >
              <div className="inline-flex items-center gap-2 text-xs hover:opacity-80 bg-card rounded-lg px-4 py-1">
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
                      'font-bold flex items-center gap-1 mr-4'
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
                <span>{formatTimeAgo(activity.timestamp)}</span>
                <span>•</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

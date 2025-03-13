'use client'

import { useActivityTape } from '@/components/components-new-version/activity-tape/hooks/use-activity-tape'
import Link from 'next/link'

export function ActivityTape() {
  const { allActivities, contentRef, formatTimeAgo, setIsPaused } =
    useActivityTape()

  return (
    <div className="flex items-center pt-2">
      <div
        className="flex-1 overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div ref={contentRef} className="flex gap-3 whitespace-nowrap">
          {[...allActivities, ...allActivities].map((activity, i) => (
            <Link
              key={i}
              href={activity.signature ? `/${activity.signature}` : '#'}
            >
              <div className="inline-flex items-center gap-2 text-xs hover:opacity-80 bg-card-accent rounded-lg px-4 py-1">
                <span className="bg-background py-1 px-1.5 rounded">
                  {activity.action}
                </span>
                <span>{activity.text}</span>
                <span className="flex-shrink-0">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

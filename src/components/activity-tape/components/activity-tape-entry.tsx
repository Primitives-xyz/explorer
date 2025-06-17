'use client'

import { IActivityGlobal } from '@/components/activity-tape/activity-tape.models'
import { Button } from '@/components/ui'
import { formatTimeAgo } from '@/utils/utils'
import { useEffect, useState } from 'react'

interface Props {
  activity: IActivityGlobal
}

export function ActivityTapeEntry({ activity }: Props) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null)

  useEffect(() => {
    setTimeAgo(formatTimeAgo(new Date(activity.timestamp)))
  }, [activity.timestamp])

  return (
    <Button isInvisible className="opacity-100!" disabled>
      <div className="inline-flex items-center gap-2 text-xs bg-card rounded-lg px-4 py-1">
        <span className="bg-background py-1 px-1.5 rounded">
          {activity.action}
        </span>
        <span>{activity.text}</span>
        <span>•</span>
        {timeAgo && <span>{timeAgo}</span>}
      </div>
    </Button>
  )
}

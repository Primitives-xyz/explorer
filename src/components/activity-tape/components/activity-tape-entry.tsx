import { Button } from '@/components/ui'
import { cn, formatTimeAgo } from '@/utils/utils'
import Image from 'next/image'
import { IActivityTapeEntry } from '../activity-tape.models'

interface Props {
  activity: IActivityTapeEntry
}

export function ActivityTapeEntry({ activity }: Props) {
  return (
    <Button
      isInvisible
      disabled={!activity.signature}
      href={activity.signature ? `/${activity.signature}` : '#'}
      className="opacity-100!"
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
        <span>{formatTimeAgo(new Date(activity.timestamp))}</span>
      </div>
    </Button>
  )
}

import { useQuery } from '@/utils/api'
import { useMemo } from 'react'
import {
  IActivityGlobalResponse,
  IActivityTapeEntry,
} from '../activity-tape.models'

export function useActivityTape() {
  const { data } = useQuery<IActivityGlobalResponse>({
    endpoint: 'activity/global',
  })

  console.log({ data })

  const activities: IActivityTapeEntry[] = useMemo(() => {
    return (
      data?.activities?.map((activity) => {
        let text = ''
        let action = ''
        let highlight = 'neutral'

        switch (activity.type) {
          case 'new_follower':
            text = `${activity.actor_username} followed ${activity.target_username}`
            action = '👥'
            break
          case 'new_content':
            text = `${activity.actor_username} published ${activity.content_type}`
            action = '📝'
            highlight = 'positive'
            break
          case 'like':
            text = `${activity.actor_username} liked a ${activity.content_type}`
            action = '❤️'
            highlight = 'positive'
            break
          case 'comment':
            text = `${activity.actor_username} commented on content`
            action = '💬'
            break
          default:
            text = `${activity.actor_username} ${activity.activity}`
            action = '📢'
        }

        return {
          type: activity.type,
          text,
          action,
          wallet: activity.actor_id,
          timestamp: activity.timestamp,
          highlight,
        }
      }) ?? []
    )
  }, [data])

  return { data: { activities } }
}

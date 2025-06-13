import { useQuery } from '@/utils/api'
import { useMemo } from 'react'
import {
  IActivityGlobal,
  IActivityGlobalResponse,
} from '../activity-tape.models'

export function useActivityTape() {
  const { data, loading } = useQuery<IActivityGlobalResponse>({
    endpoint: 'activity/global',
  })

  const activities: IActivityGlobal[] = useMemo(() => {
    return (
      data?.activities?.map((activity) => {
        let text = ''
        let action = ''

        switch (activity.type) {
          case 'new_follower':
            text = activity.target_username
              ? `${activity.actor_username} followed ${activity.target_username}`
              : `${activity.actor_username} followed someone`
            action = '👥'
            break
          case 'new_content':
            text = activity.content_type
              ? `${activity.actor_username} published ${activity.content_type}`
              : `${activity.actor_username} published content`
            action = '📝'

            break
          case 'like':
            text = activity.content_type
              ? `${activity.actor_username} liked a ${activity.content_type}`
              : `${activity.actor_username} liked content`
            action = '❤️'

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
          actor_id: activity.actor_id,
          actor_username: activity.actor_username,
          target_id: activity.target_id || '',
          target_username: activity.target_username,
          comment_id: activity.comment_id,
          activity: activity.activity,
          timestamp: activity.timestamp,
          text,
          action,
        }
      }) ?? []
    )
  }, [data])

  return { data: { activities }, loading }
}

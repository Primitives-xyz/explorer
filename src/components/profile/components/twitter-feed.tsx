import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'
import { useQuery } from '@/utils/api'

interface Props {
  explorerProfile: IGetProfilesResponseEntry
}

export function TwitterFeed({ explorerProfile }: Props) {
  const { data, error, loading } = useQuery<{
    user: { username: string }
    tweets: { id: string; text: string; created_at: string }[]
  }>({
    endpoint: `/x/user`,
    queryParams: {
      profile: explorerProfile?.profile?.id,
    },
    skip: !explorerProfile?.profile?.id,
  })

  console.log('TwitterFeed data:', data)
  console.log('TwitterFeed error:', error)

  if (loading) return <p>Loading tweets...</p>
  if (error) return <p className="text-destructive">Error fetching tweets</p>
  if (!data?.tweets?.length) return <p>No tweets found</p>

  return (
    <div className="space-y-4">
      {data.tweets.map((tweet) => (
        <div key={tweet.id} className="p-4 border rounded bg-muted">
          <p className="whitespace-pre-wrap text-sm">{tweet.text}</p>
          <p className="text-xs mt-1">
            {new Date(tweet.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}

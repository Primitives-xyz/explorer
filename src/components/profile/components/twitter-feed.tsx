import { useGetXFeed } from '@/components/tapestry/hooks/use-get-x-feed'
import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'

interface Props {
  profile: IGetProfilesResponseEntry
}
export function TwitterFeed({ profile }: Props) {
  const { data, error, loading } = useGetXFeed({
    xUsername: profile.profile.username,
  })

  console.log({ data })

  if (loading) return <p>Loading tweets...</p>
  if (error) return <p className="text-destructive">Error fetching tweets</p>
  if (!data?.tweets?.length) return <p>No tweets found</p>

  return (
    <div className="space-y-4">
      {/* {data.tweets.map((tweet) => (
        <div key={tweet.id} className="p-4 border rounded bg-muted">
          <p className="whitespace-pre-wrap text-sm">{tweet.text}</p>
          <p className="text-xs mt-1">
            {new Date(tweet.created_at).toLocaleString()}
          </p>
        </div>
      ))} */}
    </div>
  )
}

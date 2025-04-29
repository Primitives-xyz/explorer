import { useGetXFeed } from '@/components/tapestry/hooks/use-get-x-feed'
import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardHeader,
  Spinner,
} from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { ExternalLink, Heart, IterationCw } from 'lucide-react'

interface Props {
  profile: IGetProfilesResponseEntry
}
export function TwitterFeed({ profile }: Props) {
  const { data, error, loading } = useGetXFeed({
    xUsername: profile.profile.username,
  })

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 space-y-5">
      {loading && <Spinner />}
      {error && <p className="text-xs">Error fetching tweets</p>}
      {!data?.tweets?.length && <p className="text-xs">No tweets found</p>}
      <div className="flex flex-col gap-3 w-full max-h-[calc(100vh-500px)] overflow-auto">
        {data?.tweets.map((tweet) => (
          <div key={tweet.id}>
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <p>{data.handle}</p>
                  <Button
                    variant={ButtonVariant.LINK}
                    size={ButtonSize.ICON}
                    href={tweet.url}
                    newTab
                  >
                    <ExternalLink size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-5">
                  <p className="whitespace-pre-wrap text-sm">{tweet.text}</p>
                  <div className="flex justify-between items-end">
                    <div className="flex gap-6">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Heart size={12} />{' '}
                        {formatSmartNumber(tweet.likes, {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <IterationCw size={12} />{' '}
                        {formatSmartNumber(tweet.retweets, {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tweet.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

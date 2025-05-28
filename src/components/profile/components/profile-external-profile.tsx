import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'
import { Button, Card, CardContent, CardVariant } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, cn } from '@/utils/utils'
import { ExternalLinkIcon } from 'lucide-react'

interface Props {
  profile: IGetProfilesResponseEntry
}

function getProfileUrl(profile: IGetProfilesResponseEntry): string {
  let url: string

  // Explorer namespace uses internal routing
  if (profile.namespace.name === EXPLORER_NAMESPACE) {
    return route('entity', {
      id: profile.profile.username,
    })
  }

  // If namespace has a custom profile URL
  if (profile.namespace.userProfileURL) {
    const identifier =
      profile.namespace.name === 'tribe.run' && profile.wallet?.address
        ? profile.wallet.address
        : profile.profile.username

    // Ensure no double slashes by removing trailing slash from base URL
    const baseUrl = profile.namespace.userProfileURL.replace(/\/$/, '')
    url = `${baseUrl}/${identifier}`
  }
  // Default URL construction
  else if (profile.namespace.name) {
    url = `/${profile.namespace.name}/${profile.profile.username}`
  }
  // Fallback when namespace name is empty
  else {
    url = `/${profile.profile.username}`
  }

  // Clean up any double slashes (except after protocol like https://)
  return url.replace(/([^:]\/)\/+/g, '$1')
}

export function ProfileExternalProfile({ profile }: Props) {
  const disabled =
    profile.namespace.name !== EXPLORER_NAMESPACE &&
    profile.namespace.name === 'tribe.run' &&
    !profile.wallet?.address

  const isSame = profile.profile.username === profile.wallet?.address

  return (
    <>
      <Card variant={CardVariant.ACCENT_SOCIAL}>
        <CardContent className="p-4">
          <Button
            className={cn('flex gap-3 items-start', {
              'opacity-100!': disabled,
            })}
            isInvisible
            disabled={disabled}
            href={getProfileUrl(profile)}
            newTab={profile.namespace.name !== EXPLORER_NAMESPACE}
          >
            <div>
              <Avatar
                imageUrl={profile.profile.image}
                username={profile.profile.username}
                className="w-10"
                size={40}
              />
            </div>
            <div className="flex-1 w-full overflow-hidden flex flex-col items-start justify-start gap-1">
              <div className="text-sm truncate text-secondary flex items-center gap-2">
                {isSame
                  ? abbreviateWalletAddress({
                      address: profile.profile.username,
                    })
                  : `@${profile.profile.username} `}
                {!disabled && (
                  <ExternalLinkIcon className="text-foreground" size={14} />
                )}
              </div>
              {!!profile.profile.bio && (
                <div className="text-xs text-muted-foreground truncate">
                  {profile.profile.bio}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {profile.socialCounts?.followers ?? 0} Followers |{' '}
                {profile.socialCounts?.following ?? 0} Following
              </p>
            </div>
          </Button>
        </CardContent>
      </Card>
      {/* <Separator /> */}
      {/* <IdentityContentNodes identity={identity} /> */}
    </>
  )
}

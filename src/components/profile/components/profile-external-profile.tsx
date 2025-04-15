import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'
import {
  Button,
  Card,
  CardContent,
  CardVariant,
  Separator,
} from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'
import { ExternalLinkIcon } from 'lucide-react'
import { IdentityContentNodes } from './identity-content-nodes'

interface Props {
  identity: IGetProfilesResponseEntry
}

export function ProfileExternalProfile({ identity }: Props) {
  const disabled =
    identity.namespace.name !== EXPLORER_NAMESPACE &&
    !identity.namespace.userProfileURL

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
            href={
              identity.namespace.name === EXPLORER_NAMESPACE
                ? route('entity', {
                    id: identity.profile.username,
                  })
                : `${identity.namespace.userProfileURL}/${identity.profile.username}`
            }
          >
            <div>
              <Avatar
                imageUrl={identity.profile.image}
                username={identity.profile.username}
                className="w-10"
                size={40}
              />
            </div>
            <div className="flex-1 w-full overflow-hidden flex flex-col items-start justify-start gap-1">
              <div className="text-sm truncate text-secondary flex items-center gap-2">
                @{identity.profile.username}{' '}
                {!disabled && (
                  <ExternalLinkIcon className="text-foreground" size={14} />
                )}
              </div>
              {!!identity.profile.bio && (
                <div className="text-xs text-muted-foreground truncate">
                  {identity.profile.bio}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {identity.socialCounts?.followers ?? 0} Followers |{' '}
                {identity.socialCounts?.following ?? 0} Following
              </p>
            </div>
          </Button>
        </CardContent>
      </Card>
      <Separator />
      <IdentityContentNodes identity={identity} />
    </>
  )
}

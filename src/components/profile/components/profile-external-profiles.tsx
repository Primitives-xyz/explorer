'use client'

import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { Button, ButtonVariant, Spinner } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { ExternalLinkIcon } from 'lucide-react'

interface Props {
  walletAddress: string
}

export function ProfileExternalProfiles({ walletAddress }: Props) {
  const { identities, loading } = useGetIdentities({
    walletAddress,
  })

  if (loading) {
    return (
      <div className="h-20 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {identities?.map((identity, index) => (
        <div
          key={`${identity.namespace.name}-${identity.profile.username}-${index}`}
          className="py-2"
        >
          <Button
            disabled={
              identity.namespace.name !== EXPLORER_NAMESPACE &&
              (!identity.namespace.userProfileURL ||
                (identity.namespace.name === 'tribe.run' && !identity.wallet?.address))
            }
            href={
              identity.namespace.name === EXPLORER_NAMESPACE
                ? route('entity', {
                    id: identity.profile.username,
                  })
                : identity.namespace.name === 'tribe.run' && identity.wallet?.address
                ? `${identity.namespace.userProfileURL}${identity.wallet.address}`
                : `${identity.namespace.userProfileURL}${identity.profile.username}`
            }
            newTab={identity.namespace.name !== EXPLORER_NAMESPACE}
            variant={ButtonVariant.GHOST}
            className="w-full h-auto gap-2 px-2.5 items-start justify-start"
          >
            <Avatar
              imageUrl={identity.profile.image}
              username={identity.profile.username}
            />
            <div className="flex-1 w-full overflow-hidden flex flex-col items-start justify-start gap-1">
              <div className="text-sm truncate">
                {identity.profile.username}
              </div>
              {!!identity.profile.bio && (
                <div className="text-xs truncate font-light">
                  {identity.profile.bio}
                </div>
              )}
              <p className="text-xs text-muted-foreground font-light">
                {identity.socialCounts?.followers ?? 0} Followers •{' '}
                {identity.socialCounts?.following ?? 0} Following •{' '}
                {identity.namespace.readableName}
              </p>
            </div>
            <ExternalLinkIcon
              className="text-muted-foreground ml-10"
              size={16}
            />
          </Button>
        </div>
      ))}
    </div>
  )
}

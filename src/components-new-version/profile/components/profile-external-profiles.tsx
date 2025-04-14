'use client'

import { useGetIdentities } from '@/components-new-version/tapestry/hooks/use-get-identities'
import { Button, ButtonVariant, Spinner } from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/components-new-version/utils/constants'
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
            href={
              identity.namespace.name === EXPLORER_NAMESPACE
                ? `/${identity.profile.username}`
                : `/n/${identity.namespace.name}/${identity.profile.username}`
            }
            className="w-full h-auto gap-2 px-2.5 items-start"
            variant={ButtonVariant.GHOST}
          >
            {/* <div className="relative shrink-0 w-8 aspect-square rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {identity.namespace.faviconURL ? (
                <Image
                  src={identity.namespace.faviconURL}
                  alt={identity.namespace.readableName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary text-lg">
                  {identity.namespace.readableName.charAt(0)}
                </span>
              )}
            </div> */}
            <Avatar
              imageUrl={identity.profile.image}
              username={identity.profile.username}
            />
            <div className="flex-1 w-full overflow-hidden flex flex-col gap-1">
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

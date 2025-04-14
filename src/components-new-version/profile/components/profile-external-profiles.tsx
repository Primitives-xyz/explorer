'use client'

import { useGetIdentities } from '@/components-new-version/tapestry/hooks/use-get-identities'
import { Button, ButtonVariant, Spinner } from '@/components-new-version/ui'
import { EXPLORER_NAMESPACE } from '@/components-new-version/utils/constants'
import { ExternalLinkIcon } from 'lucide-react'
import Image from 'next/image'

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
    <div className="space-y-2">
      {identities?.map((identity, index) => (
        <Button
          key={`${identity.namespace.name}-${identity.profile.username}-${index}`}
          href={
            identity.namespace.name === EXPLORER_NAMESPACE
              ? `/${identity.profile.username}`
              : `/n/${identity.namespace.name}/${identity.profile.username}`
          }
          className="w-full h-auto gap-2 px-2.5"
          variant={ButtonVariant.GHOST}
        >
          <div className="relative shrink-0 w-8 aspect-square rounded-full overflow-hidden bg-muted flex items-center justify-center">
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
          </div>
          <div className="flex-1">
            <div className="text-sm truncate">{identity.profile.username}</div>
            <div className="text-xs truncate text-muted-foreground">
              {identity.namespace.readableName}
            </div>
          </div>
          <ExternalLinkIcon className="text-muted-foreground" size={16} />
        </Button>
      ))}
    </div>
  )
}

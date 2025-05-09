'use client'

import { INamespaceProfileInfos } from '@/components/tapestry/models/namespace.models'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import Image from 'next/image'

interface Props {
  profileData: INamespaceProfileInfos
  username: string
  namespace: string
}

export function NamespaceProfileHeader({
  profileData,
  username,
  namespace,
}: Props) {
  let namespaceLink = profileData?.namespace?.userProfileURL
    ? profileData?.namespace?.userProfileURL
    : null
  if (namespaceLink != null && namespace != null) {
    namespaceLink = ['kolscan', 'tribe.run'].includes(namespace)
      ? `${namespaceLink}${profileData?.walletAddress}`
      : `${namespaceLink}${username}`
  }

  return (
    <div className="flex w-full justify-between items-start">
      <div className="flex flex-col space-y-2">
        {profileData?.namespace?.name && profileData?.namespace?.faviconURL && (
          <div className="flex items-center gap-2">
            <div>
              <Image
                src={profileData?.namespace?.faviconURL}
                alt="favicon"
                width={16}
                height={16}
                className="rounded-full object-cover"
              />
            </div>
            <p>{profileData?.namespace?.readableName}</p>
          </div>
        )}

        <div>
          {namespaceLink && namespaceLink !== '' && (
            <Button
              newTab
              href={namespaceLink}
              variant={ButtonVariant.BADGE}
              size={ButtonSize.SM}
            >
              See original
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <p className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{profileData?.socialCounts?.followers} Followers</span>
          <span>|</span>
          <span>{profileData?.socialCounts?.following} Following</span>
        </p>
      </div>
    </div>
  )
}

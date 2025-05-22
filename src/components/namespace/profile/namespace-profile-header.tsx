'use client'

import { INamespaceProfileInfos } from '@/components/tapestry/models/namespace.models'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('namespace.profile')

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
          {profileData?.namespace?.externalProfileURLKey &&
            profileData.namespace.externalProfileURLKey !== '' && (
              <Button
                newTab
                href={profileData.namespace.externalProfileURLKey}
                variant={ButtonVariant.BADGE}
                size={ButtonSize.SM}
              >
                {t('see_original')}
              </Button>
            )}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <p className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>
            {t('followers_count', {
              count: profileData?.socialCounts?.followers,
            })}
          </span>
          <span>|</span>
          <span>
            {t('following_count', {
              count: profileData?.socialCounts?.following,
            })}
          </span>
        </p>
      </div>
    </div>
  )
}

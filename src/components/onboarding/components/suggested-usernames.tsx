'use client'

import { ISuggestedUsername } from '@/components/tapestry/models/profiles.models'
import { cn } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Button, ButtonVariant, Label } from '../../ui'

interface Props {
  suggestedUsernames: ISuggestedUsername[]
  suggestedUsername?: ISuggestedUsername
  setSuggestedUsername: (identity: ISuggestedUsername) => void
}

export function SuggestedUsernames({
  suggestedUsernames,
  suggestedUsername,
  setSuggestedUsername,
}: Props) {
  const t = useTranslations()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{t('onboarding.suggested.usernames.title')}</Label>
        {!!suggestedUsernames?.length && (
          <div className="text-muted-foreground">
            {t('onboarding.suggested.usernames.available', {
              count: suggestedUsernames.length,
            })}
          </div>
        )}
      </div>
      <div className="space-x-2 space-y-2 h-[350px] overflow-y-auto">
        {suggestedUsernames?.map((entry, index) => (
          <Button
            key={index}
            variant={
              suggestedUsername?.username === entry.username
                ? ButtonVariant.SELECTABLE_ACTIVE
                : ButtonVariant.SELECTABLE
            }
            onClick={() => setSuggestedUsername(entry)}
            className="text-sm"
          >
            <span
              className={cn({
                'text-background':
                  suggestedUsername?.username === entry.username,
                'text-primary': suggestedUsername?.username !== entry.username,
              })}
            >
              {entry.username} |{' '}
            </span>
            {entry.faviconURL && (
              <Image
                src={entry.faviconURL}
                alt="favicon"
                width={16}
                height={16}
                className="inline-block"
              />
            )}
            {entry.readableName}
          </Button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { ISuggestedUsername } from '@/components/models/profiles.models'
import { cn } from '@/components/utils/utils'
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
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Suggested Usernames</Label>
        {!!suggestedUsernames?.length && (
          <div className="text-muted-foreground">
            ({suggestedUsernames.length} available)
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
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

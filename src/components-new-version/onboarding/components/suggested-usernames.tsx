'use client'

import { ISuggestedUsername } from '@/components-new-version/models/profiles.models'
import { cn } from '@/components-new-version/utils/utils'
import Image from 'next/image'
import { Button, ButtonVariant, Label, Spinner } from '../../ui'
import { useIdentities } from '../hooks/use-identities'
import { useSuggestedProfileData } from '../hooks/use-suggested-profile-data'

interface Props {
  walletAddress: string
  suggestedUsername?: ISuggestedUsername
  setSuggestedUsername: (identity: ISuggestedUsername) => void
}

export function SuggestedUsernames({
  walletAddress,
  suggestedUsername,
  setSuggestedUsername,
}: Props) {
  const { identities, loading: getIdentitiesLoading } = useIdentities({
    walletAddress,
  })

  const { suggestedUsernames, loading: getSuggestedUsernamesLoading } =
    useSuggestedProfileData({
      suggestedProfiles: identities,
      loadingSuggestions: getIdentitiesLoading,
      walletAddress,
    })

  const loading = getIdentitiesLoading || getSuggestedUsernamesLoading

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
      {!suggestedUsernames?.length && !loading && (
        <p className="text-sm text-muted-foreground">
          No suggested usernames available.
        </p>
      )}
      {loading && (
        <div className="flex items-center justify-center h-[100px]">
          <Spinner />
        </div>
      )}
    </div>
  )
}

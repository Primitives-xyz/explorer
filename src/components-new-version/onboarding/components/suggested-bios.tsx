'use client'

import { Label, Spinner } from '../../ui'
import { useIdentities } from '../hooks/use-identities'
import { useSuggestedProfileData } from '../hooks/use-suggested-profile-data'

interface Props {
  walletAddress: string
  setSuggestedBio: (bio: string) => void
}

export function SuggestedBios({ walletAddress, setSuggestedBio }: Props) {
  const { identities, loading: getIdentitiesLoading } = useIdentities({
    walletAddress,
  })

  const { suggestedBios, loading: getSuggestedBiosLoading } =
    useSuggestedProfileData({
      suggestedProfiles: identities,
      loadingSuggestions: getIdentitiesLoading,
      walletAddress,
    })

  const loading = getIdentitiesLoading || getSuggestedBiosLoading

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Suggested Bios</Label>
        {!!suggestedBios?.length && (
          <div className="text-muted-foreground">
            ({suggestedBios.length} available)
          </div>
        )}
      </div>
      <div className="bg-muted rounded-lg space-y-4 h-full p-4 overflow-auto">
        {suggestedBios?.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
        {!suggestedBios?.length && !loading && (
          <p className="text-sm text-muted-foreground">
            No suggested bios available.
          </p>
        )}
      </div>
      {loading && (
        <div className="flex items-center justify-center h-[100px]">
          <Spinner />
        </div>
      )}
    </div>
  )
}

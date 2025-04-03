'use client'

import Image from 'next/image'
import { Button, Label, Spinner } from '../../ui'
import { useIdentities } from '../hooks/use-identities'
import { useSuggestedProfileData } from '../hooks/use-suggested-profile-data'

interface Props {
  walletAddress: string
  setSuggestedImage: (imageUrl: string) => Promise<void>
}

export function SuggestedImages({ walletAddress, setSuggestedImage }: Props) {
  const { identities, loading: getIdentitiesLoading } = useIdentities({
    walletAddress,
  })

  const {
    suggestedImages,
    suggestedBios,
    loading: getSuggestedImagesLoading,
  } = useSuggestedProfileData({
    suggestedProfiles: identities,
    loadingSuggestions: getIdentitiesLoading,
    walletAddress,
  })

  console.log(suggestedBios)

  const loading = getIdentitiesLoading || getSuggestedImagesLoading

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Suggested Images</Label>
        {!!identities?.length && (
          <div className="text-muted-foreground">
            ({identities.length} available)
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {suggestedImages?.map((entry, index) => (
          <Button
            key={index}
            onClick={() => setSuggestedImage(entry)}
            className="bg-muted rounded-lg overflow-hidden aspect-square relative"
            isInvisible
          >
            <Image
              src={entry}
              alt=""
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </Button>
        ))}
      </div>
      {!suggestedImages?.length && !loading && (
        <p className="text-sm text-muted-foreground">
          No suggested images available.
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

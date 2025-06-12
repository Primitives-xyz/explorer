'use client'

import { IProfile } from '@/components/tapestry/models/profiles.models'
import { useGeneratePudgyShareImage } from '../hooks/use-generate-pudgy-share-image'
import { ShareTweetDialog } from './share-tweet-dialog/share-tweet-dialog'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  profile: IProfile
}

export function SharePudgyDialog({ open, setOpen, profile }: Props) {
  const { data, loading } = useGeneratePudgyShareImage({
    profile,
  })

  return (
    <ShareTweetDialog
      open={open}
      setOpen={setOpen}
      imageData={data}
      isGeneratingImage={loading}
      tweetText="I just claimed my PUDGY x $SSE profile 🐧 Claim yours before it's too late!"
      imageFilename="pudgy-x-sse.png"
      modalTitle="Share Your Pudgy x SSE Profile"
      instructionTitle="How to share your profile:"
      shareXModalTitle="How to share your profile on X"
    />
  )
}

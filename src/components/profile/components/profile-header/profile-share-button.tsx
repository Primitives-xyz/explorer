import { ShareTweetDialog } from '@/components/pudgy/components/share-tweet-dialog'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import { Button, ButtonVariant } from '@/components/ui'
import { createURL } from '@/utils/api/fetch-wrapper'
import { share } from '@/utils/share'
import { ShareIcon } from 'lucide-react'
import { useState } from 'react'

interface Props {
  profile: IProfile
  isPudgy: boolean
}

export function ProfileShareButton({ profile, isPudgy }: Props) {
  const [openPudgyShareDialog, setOpenPudgyShareDialog] = useState(false)

  return (
    <>
      <Button
        className="w-full"
        variant={
          isPudgy ? ButtonVariant.PUDGY_SECONDARY : ButtonVariant.DEFAULT_SOCIAL
        }
        onClick={() =>
          isPudgy
            ? setOpenPudgyShareDialog(true)
            : share({
                title: 'Check out this profile on SSE!',
                url: createURL({
                  domain: window.location.origin,
                  endpoint: profile.username,
                }),
              })
        }
      >
        {!isPudgy && <ShareIcon size={16} />} Share
      </Button>
      <ShareTweetDialog
        open={openPudgyShareDialog}
        setOpen={setOpenPudgyShareDialog}
        profile={profile}
      />
    </>
  )
}

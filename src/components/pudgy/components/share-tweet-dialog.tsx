'use client'

import { IProfile } from '@/components/tapestry/models/profiles.models'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui'
import { DialogTitle } from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useGeneratePudgyShareImage } from '../hooks/use-generate-pudgy-share-image'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  profile: IProfile
}

export function ShareTweetDialog({ open, setOpen, profile }: Props) {
  const { data, loading, error } = useGeneratePudgyShareImage({
    profile,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Your Pudgy x SSE Profile</DialogTitle>
        </DialogHeader>
        {data && (
          <Image
            src={URL.createObjectURL(data)}
            alt="Pudgy x SSE Profile"
            width={367}
            height={367}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

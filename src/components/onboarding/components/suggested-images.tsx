'use client'

import Image from 'next/image'
import { Button, Label } from '../../ui'

interface Props {
  suggestedImages: string[]
  setSuggestedImage: (imageUrl: string) => Promise<void>
}

export function SuggestedImages({ suggestedImages, setSuggestedImage }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Suggested Images</Label>
        {!!suggestedImages?.length && (
          <div className="text-muted-foreground">
            ({suggestedImages.length} available)
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
    </div>
  )
}

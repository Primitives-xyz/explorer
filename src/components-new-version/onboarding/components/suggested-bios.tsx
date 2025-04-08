'use client'

import { Label } from '../../ui'

interface Props {
  suggestedBios: string[]
}

export function SuggestedBios({ suggestedBios }: Props) {
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
      </div>
    </div>
  )
}

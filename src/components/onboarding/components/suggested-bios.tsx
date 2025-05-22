'use client'

import { Button, ButtonVariant, Label } from '@/components/ui'
import { useTranslations } from 'next-intl'

interface Props {
  suggestedBios: string[]
  onClickSuggestedBio: (bio: string) => void
}

export function SuggestedBios({ suggestedBios, onClickSuggestedBio }: Props) {
  const t = useTranslations()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{t('onboarding.suggested.bios.title')}</Label>
        {!!suggestedBios?.length && (
          <div className="text-muted-foreground">
            {t('onboarding.suggested.bios.available', {
              count: suggestedBios.length,
            })}
          </div>
        )}
      </div>
      <div className="bg-muted rounded-lg space-y-4 h-full p-4 overflow-auto">
        {suggestedBios?.map((entry, index) => (
          <Button
            key={index}
            variant={ButtonVariant.GHOST}
            className="w-full items-start justify-start text-left"
            onClick={() => onClickSuggestedBio(entry)}
          >
            {entry}
          </Button>
        ))}
      </div>
    </div>
  )
}

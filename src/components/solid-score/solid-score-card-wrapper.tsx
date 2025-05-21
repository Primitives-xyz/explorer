import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  displayScore: boolean
}

export function SolidScoreCardWrapper({ children, displayScore }: Props) {
  const t = useTranslations('menu.solid_score')

  return (
    <>
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-primary font-bold flex items-center justify-between">
            {displayScore ? t('your_score') : t('reveal_your_score')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col relative w-full">
          {children}
        </CardContent>
      </Card>
    </>
  )
}

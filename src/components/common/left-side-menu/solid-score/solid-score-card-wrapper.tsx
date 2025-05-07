import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Share } from 'lucide-react'

export function SolidScoreCardWrapper({
  children,
  displayScore,
}: {
  children: React.ReactNode
  displayScore: boolean
}) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary font-bold flex items-center justify-between">
          {displayScore ? 'Your SOLID Score' : 'Reveal Your SOLID Score'}
          {displayScore && <Share size={16} />}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col relative w-full">
        {children}
      </CardContent>
    </Card>
  )
}

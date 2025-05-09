import { SolidScoreDialog } from '@/components/common/left-side-menu/solid-score/solid-score-dialog'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { Share } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface Props {
  children: ReactNode
  displayScore: boolean
}

export function SolidScoreCardWrapper({ children, displayScore }: Props) {
  const [openShareDialog, setOpenShareDialog] = useState(false)

  return (
    <>
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-primary font-bold flex items-center justify-between">
            {displayScore ? 'Your SOLID Score' : 'Reveal Your SOLID Score'}
            {displayScore && (
              <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.ICON_SM}
                onClick={() => setOpenShareDialog(true)}
              >
                <Share size={16} className="text-primary" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col relative w-full">
          {children}
        </CardContent>
      </Card>
      <SolidScoreDialog open={openShareDialog} setOpen={setOpenShareDialog} />
    </>
  )
}

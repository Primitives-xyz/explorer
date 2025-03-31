import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'
import { Button } from '@/components-new-version/ui/button'
import { ArrowLeftRight } from 'lucide-react'

export function LowFeeTrades() {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary font-bold">
          Low Fee Trades with SSE
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <p className="text-sm  text-muted-foreground">
          SSE offers the cheapest fee across all current platforms.
        </p>
        <Button expand>
          <ArrowLeftRight size={16} />
          Trade
        </Button>
      </CardContent>
    </Card>
  )
}

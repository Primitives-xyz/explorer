import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { route } from '@/utils/route'
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
          SSE offers the lowest fees across all current platforms.
        </p>
        <Button className="w-full" href={route('trade')}>
          <ArrowLeftRight size={16} />
          Trade
        </Button>
      </CardContent>
    </Card>
  )
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'

interface GraphProps {
  id: string
}

export function Graph({ id }: GraphProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>TokenGraph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-[400px]'>
          <iframe
            width="100%"
            height="100%"
            src={`https://birdeye.so/tv-widget/${id}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark&defaultMetric=mcap`}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  )
}

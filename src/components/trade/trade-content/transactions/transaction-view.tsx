import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import TimeAgo from '@/components/trade/trade-content/transactions/time-ago'
import { Card, CardContent } from '@/components/ui'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface TransactionView {
  signature: string
  timestamp: number
  baseTokenMint: string
  baseTokenAmount: number
  quoteTokenMint: string
  quoteTokenAmount: number
}

export default function TransactionView({
  signature,
  timestamp,
  baseTokenMint,
  baseTokenAmount,
  quoteTokenMint,
  quoteTokenAmount,
}: TransactionView) {
  const { symbol: baseTokenSymbol, image: baseTokenImageUri } =
    useTokenInfo(baseTokenMint)
  const { symbol: quoteTokenSymbol, image: quoteTokenImageUri } =
    useTokenInfo(quoteTokenMint)

  return (
    <Card>
      <CardContent className="px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <div className="flex items-center gap-2">
              <Image
                src={baseTokenImageUri || '/placeholder.svg'}
                alt={'baseTokenImage'}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <Image
                src={quoteTokenImageUri || '/placeholder.svg'}
                alt={'quoteTokenImage'}
                width={32}
                height={32}
                className="rounded-full object-cover -translate-x-2/3"
              />
            </div>

            <div className="flex items-center">
              <span>
                {baseTokenAmount} {baseTokenSymbol}
              </span>
              <ArrowRight className="inline mx-2 w-4 h-4" />
              <span>
                {quoteTokenAmount} {quoteTokenSymbol}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <Link href={`https://solscan.io/tx/${signature}`} target="_blank">
              <div className="transition-colors">
                <ExternalLink className="w-5 h-5" />
              </div>
            </Link>
            <TimeAgo timestamp={timestamp} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

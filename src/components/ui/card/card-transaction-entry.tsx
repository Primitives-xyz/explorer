import { ReactNode } from 'react'
import { Card, CardContent } from './card'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  thumb?: ReactNode
  price: string | number
  subPrice?: string
}

export function CardTransactionEntry({
  title,
  subtitle,
  thumb,
  price,
  subPrice,
}: Props) {
  return (
    <Card>
      <CardContent className="flex gap-3 items-center">
        {thumb && <div className="flex items-center">{thumb}</div>}
        <div className="flex flex-col gap-2">
          <div className="font-bold text-md">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
        <div className="text-right ml-auto">
          <div className="h-full flex justify-between flex-col">
            <div className="text-base">{price}</div>
            {subPrice && (
              <div className="text-muted-foreground text-sm">{subPrice}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

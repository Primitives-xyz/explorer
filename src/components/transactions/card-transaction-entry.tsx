import type { ReactNode } from 'react'
import { Card } from '../common/card'

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
    <Card className="flex gap-small items-center">
      {thumb && <div className="flex items-center">{thumb}</div>}
      <div className="flex flex-col gap-mini">
        <div className="font-bold text-button2">{title}</div>
        {subtitle && <div className="text-subtext text-2">{subtitle}</div>}
      </div>
      <div className="text-right ml-auto">
        <div className="h-full flex justify-between flex-col">
          <div className="text-base">{price}</div>
          {subPrice && <div className="text-2 text-subtext">{subPrice}</div>}
        </div>
      </div>
    </Card>
  )
}

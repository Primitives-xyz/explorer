import { Badge } from '@/components-new-version/ui'
import {
  getSourceIcon,
  getTransactionTypeColor,
} from '@/components-new-version/utils/transactions'

interface Props {
  type: string
  source?: string
}

export function TransactionBadge({ type, source }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
      <Badge
        className={`rounded border font-mono whitespace-nowrap ${getTransactionTypeColor(
          type,
          source || ''
        )}`}
      >
        {type}
      </Badge>
      {source && (
        <Badge
          className={`rounded border font-mono flex items-center gap-1 whitespace-nowrap ${getTransactionTypeColor(
            type,
            source
          )}`}
        >
          {getSourceIcon(source)}
          <span className="hidden sm:inline">{source}</span>
          <span className="sm:hidden">{source.slice(0, 3)}</span>
        </Badge>
      )}
    </div>
  )
}

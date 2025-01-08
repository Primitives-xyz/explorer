import { getTransactionTypeColor, getSourceIcon } from '@/utils/transaction'

interface TransactionBadgeProps {
  type: string
  source?: string
  size?: 'sm' | 'md'
}

export const TransactionBadge = ({
  type,
  source,
  size = 'sm',
}: TransactionBadgeProps) => {
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`rounded border font-mono font-medium ${sizeClasses} ${getTransactionTypeColor(
          type,
          source || '',
        )}`}
      >
        {type}
      </span>
      {source && (
        <span
          className={`rounded border font-mono flex items-center gap-1 ${sizeClasses} ${getTransactionTypeColor(
            type,
            source,
          )}`}
        >
          {getSourceIcon(source)}
          <span>{source}</span>
        </span>
      )}
    </div>
  )
}

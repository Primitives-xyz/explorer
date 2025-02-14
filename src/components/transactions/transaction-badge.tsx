import { getSourceIcon, getTransactionTypeColor } from '@/utils/transaction'

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
    size === 'sm'
      ? 'px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs'
      : 'px-2 sm:px-3 py-1 text-xs sm:text-sm'

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
      <span
        className={`rounded border font-mono whitespace-nowrap ${sizeClasses} ${getTransactionTypeColor(
          type,
          source || ''
        )}`}
      >
        {type}
      </span>
      {source && (
        <span
          className={`rounded border font-mono flex items-center gap-1 whitespace-nowrap ${sizeClasses} ${getTransactionTypeColor(
            type,
            source
          )}`}
        >
          {getSourceIcon(source)}
          <span className="hidden sm:inline">{source}</span>
          <span className="sm:hidden">{source.slice(0, 3)}</span>
        </span>
      )}
    </div>
  )
}

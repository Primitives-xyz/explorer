type SortBy = 'value' | 'balance' | 'symbol'

interface SortControlsProps {
  sortBy: SortBy
  onSort: (sort: SortBy) => void
}

export const SortControls = ({ sortBy, onSort }: SortControlsProps) => {
  return (
    <div className="border-b border-green-800/50 p-2 flex gap-2 overflow-x-auto scrollbar-none">
      <button
        onClick={() => onSort('value')}
        className={`text-xs font-mono px-2 py-1 rounded ${
          sortBy === 'value'
            ? 'bg-green-900/30 text-green-400'
            : 'text-green-600 hover:bg-green-900/20'
        }`}
      >
        SORT BY VALUE
      </button>
      <button
        onClick={() => onSort('balance')}
        className={`text-xs font-mono px-2 py-1 rounded ${
          sortBy === 'balance'
            ? 'bg-green-900/30 text-green-400'
            : 'text-green-600 hover:bg-green-900/20'
        }`}
      >
        SORT BY BALANCE
      </button>
      <button
        onClick={() => onSort('symbol')}
        className={`text-xs font-mono px-2 py-1 rounded ${
          sortBy === 'symbol'
            ? 'bg-green-900/30 text-green-400'
            : 'text-green-600 hover:bg-green-900/20'
        }`}
      >
        SORT BY SYMBOL
      </button>
    </div>
  )
}

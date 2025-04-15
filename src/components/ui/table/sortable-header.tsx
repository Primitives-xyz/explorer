import { Column } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

interface Props {
  label: string
  column: Column<any, unknown>
}

export function SortableHeader({ label, column }: Props) {
  const isSorted = column.getIsSorted()

  return (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      {isSorted === 'asc' && <ArrowUpIcon size={14} />}
      {isSorted === 'desc' && <ArrowDownIcon size={14} />}
    </div>
  )
}

// import { SelectContent } from '@/ui-custom/select'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { cn } from '@/utils/utils'
import type { Table } from '@tanstack/react-table'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'

interface Props<TData> {
  table: Table<TData>
  isSmall?: boolean
}

export function DataTablePagination<TData>({ table, isSmall }: Props<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p
          className={cn('text-sm whitespace-nowrap', {
            'text-xs': isSmall,
          })}
        >
          Rows per page
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue
              placeholder={table.getState().pagination.pageSize}
              className="text-xs"
            />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 10, 20, 30, 40].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        className={cn('flex w-[100px] items-center justify-center text-sm', {
          'text-xs': isSmall,
        })}
      >
        Page {table.getState().pagination.pageIndex + 1} of{' '}
        {table.getPageCount()}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant={ButtonVariant.OUTLINE}
          size={ButtonSize.ICON_SM}
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={ButtonVariant.OUTLINE}
          size={ButtonSize.ICON_SM}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={ButtonVariant.OUTLINE}
          size={ButtonSize.ICON_SM}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={ButtonVariant.OUTLINE}
          size={ButtonSize.ICON_SM}
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

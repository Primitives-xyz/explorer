'use client'

import { PoweredbyTapestry } from '@/components/common/powered-by-tapestry'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Input,
  InputPrefix,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@/components/ui'
import { cn } from '@/components/utils/utils'
import { SearchIcon, XIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { SearchResultsProfiles } from './search-results-profiles'
import { SearchResultsTokens } from './search-results-tokens'
import { SearchTopTraders } from './search-top-traders'
import { SearchTrendingTokens } from './search-trending-tokens'

export const SEARCH_RESULTS_LIMIT = 5

export function SearchButton() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const closePopover = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (!open) {
          setQuery('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={ButtonVariant.GHOST}
          className={cn(
            'flex justify-start w-full gap-4 hover:bg-primary hover:text-background',
            {
              'bg-primary text-background': open,
            }
          )}
        >
          <SearchIcon size={20} />
          Search
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        sideOffset={16}
        className="w-[375px] p-0 overflow-hidden"
      >
        <Input
          ref={ref}
          onChange={(event) => {
            const value = event.target.value
            // debounce(() => setQuery(value), 300)()
            setQuery(value)
          }}
          value={query}
          placeholder="Search a username or wallet address..."
          className="w-full border-none rounded-none"
          suffixElement={
            query ? (
              <InputPrefix onTheRight>
                <Button
                  variant={ButtonVariant.GHOST}
                  onClick={() => {
                    setQuery('')
                    ref.current?.focus()
                  }}
                  size={ButtonSize.ICON_SM}
                >
                  <XIcon size={16} />
                </Button>
              </InputPrefix>
            ) : undefined
          }
        />
        <div className="pb-4 flex flex-col items-center">
          <div className="h-[630px] w-full">
            {query.length > 2 ? (
              <>
                <SearchResultsProfiles
                  query={query}
                  closePopover={closePopover}
                />
                <Separator className="mt-3 mb-0" />
                <SearchResultsTokens
                  query={query}
                  closePopover={closePopover}
                />
              </>
            ) : (
              <>
                <SearchTopTraders closePopover={closePopover} />
                <Separator className="mt-3 mb-0" />
                <SearchTrendingTokens closePopover={closePopover} />
              </>
            )}
          </div>
          <PoweredbyTapestry />
        </div>
      </PopoverContent>
    </Popover>
  )
}

'use client'

import { PoweredbyTapestry } from '@/components/common/powered-by-tapestry'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Dialog,
  DialogContent,
  Input,
  InputPrefix,
  Separator,
} from '@/components/ui'
import { cn } from '@/utils/utils'
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

  const closeModal = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (!open) {
          setQuery('')
        }
      }}
    >
      <Button
        variant={ButtonVariant.GHOST}
        className={cn(
          'flex justify-start w-full gap-4 hover:bg-primary hover:text-background text-lg md:text-sm',
          {
            'bg-primary text-background': open,
          }
        )}
        onClick={() => setOpen(true)}
      >
        <SearchIcon size={20} />
        <span>Search</span>
      </Button>
      <DialogContent
        className="w-[95vw] md:w-[90vw] max-w-[500px] p-0 overflow-hidden max-h-[90vh]"
        onClose={closeModal}
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
          <div className="h-[350px] md:h-[500px] w-full overflow-y-auto">
            {query.length > 2 ? (
              <>
                <SearchResultsProfiles
                  query={query}
                  closePopover={closeModal}
                />
                <Separator className="mt-3 mb-0" />
                <SearchResultsTokens query={query} closePopover={closeModal} />
              </>
            ) : (
              <>
                <SearchTopTraders closePopover={closeModal} />
                <Separator className="mt-3 mb-0" />
                <SearchTrendingTokens closePopover={closeModal} />
              </>
            )}
          </div>
          <PoweredbyTapestry />
        </div>
      </DialogContent>
    </Dialog>
  )
}

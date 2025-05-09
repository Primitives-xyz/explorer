'use client'

import { Button, ButtonVariant } from '@/components/ui'

export enum FilterType {
  ALL = 'all',
  SWAP = 'swap',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
  KOL = 'kol',
}

interface Props {
  selectedType: FilterType
  setSelectedType: (type: FilterType) => void
}

export function FilterButton({ selectedType, setSelectedType }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="rounded-full"
        variant={
          selectedType === FilterType.ALL
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        onClick={() => setSelectedType(FilterType.ALL)}
      >
        All
      </Button>
      <Button
        className="rounded-full"
        variant={
          selectedType === FilterType.SWAP
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        onClick={() => setSelectedType(FilterType.SWAP)}
      >
        Swap
      </Button>
      <Button
        className="rounded-full"
        variant={
          selectedType === FilterType.COMPRESSED_NFT_MINT
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        onClick={() => setSelectedType(FilterType.COMPRESSED_NFT_MINT)}
      >
        CNFT Mints
      </Button>
      <Button
        className="rounded-full"
        variant={
          selectedType === FilterType.KOL
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        onClick={() => setSelectedType(FilterType.KOL)}
      >
        Twitter KOL
      </Button>
    </div>
  )
}

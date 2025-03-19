'use client'

import { Button, ButtonVariant } from '@/components-new-version/ui'

export enum TransactionType {
  ALL = 'all',
  SWAP = 'swap',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
}

interface Props {
  selectedType: TransactionType
  setSelectedType: (type: TransactionType) => void
}

export function FilterButton({ selectedType, setSelectedType }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="rounded-full"
        variant={
          selectedType === TransactionType.ALL
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        onClick={() => setSelectedType(TransactionType.ALL)}
      >
        All
      </Button>
      <Button
        className="rounded-full"
        variant={
          selectedType === TransactionType.SWAP
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        onClick={() => setSelectedType(TransactionType.SWAP)}
      >
        Swap
      </Button>
      <Button
        className="rounded-full"
        variant={
          selectedType === TransactionType.COMPRESSED_NFT_MINT
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        onClick={() => setSelectedType(TransactionType.COMPRESSED_NFT_MINT)}
      >
        CNFT Mints
      </Button>
    </div>
  )
}

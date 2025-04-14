'use client'

import { Button, Card, CardContent, Spinner } from '@/components/ui'
import { route } from '@/components/utils/route'
import Image from 'next/image'
import { useMagicEdenNFTs } from '../hooks/use-get-magic-eden-nfts'

interface Props {
  walletAddress: string
}

export function ProfileNfts({ walletAddress }: Props) {
  const { nfts, loading } = useMagicEdenNFTs({
    walletAddress,
  })

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm">NFTs</h3>
        <span className="text-muted-foreground text-xs">
          ({nfts?.length ?? 0})
        </span>
      </div>
      <Card>
        <CardContent className="h-[300px] overflow-auto p-3">
          {loading && (
            <div className="flex items-center justify-center w-full h-full">
              <Spinner />
            </div>
          )}
          {nfts?.length === 0 && !loading && (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-muted-foreground text-xs">
                No NFTs found
              </span>
            </div>
          )}
          {!!nfts?.length && !loading && (
            <div className="grid grid-cols-6 gap-3">
              {nfts.map((nft) => (
                <Button
                  key={nft.mintAddress}
                  className="rounded overflow-hidden aspect-square"
                  isInvisible
                  href={route('entity', {
                    id: nft.mintAddress,
                  })}
                >
                  {nft.image && (
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  )}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

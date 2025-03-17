'use client'

// React and Next.js imports
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

// UI components and icons
import { CopyPaste } from '@/components/common/copy-paste'
import { Loader2 } from 'lucide-react'

import { useNftCollection } from '@/hooks/use-nft-collection'
import { NftCollectionDetailProps } from '@/types/nft/magic-eden'
import NFTShowcase from './nft-showcase'

export default function NFTCollectionDetail({
  id,
  tokenInfo,
}: NftCollectionDetailProps) {
  // Context hooks
  const t = useTranslations()

  // Use the new hook to fetch collection data
  const { collectionSymbol, nftCollectionStat, nfts, isLoading } =
    useNftCollection(id)

  const [error, setError] = useState<string | null>(null)
  const [selectedTokenModal, setSelectedTokenModal] = useState<boolean>(false)

  return (
    <div className="py-2 px-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-center w-full from-green-500/10">
        {tokenInfo ? (
          <div className="flex flex-col gap-6 md:flex-row h-full">
            <div className="md:w-1/3">
              {tokenInfo.content.links?.image ? (
                <Link href={tokenInfo.content.links.image} target="_blank">
                  <Image
                    src={tokenInfo.content.links.image}
                    alt={tokenInfo.content.metadata.symbol}
                    className="rounded-lg"
                    width={500}
                    height={500}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement?.classList.add(
                        'h-[200px]',
                        'flex',
                        'items-center',
                        'justify-center'
                      )
                      target.insertAdjacentHTML(
                        'afterend',
                        `<div className="font-mono text-sm">Image failed to load</div>`
                      )
                    }}
                  />
                </Link>
              ) : (
                <div className="min-h-[200px] rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 flex items-center justify-center">
                  <div className="font-mono text-sm">No image available</div>
                </div>
              )}
            </div>
            <div className="md:w-2/3">
              <h2 className="text-xl font-bold text-green-500">
                {tokenInfo.content.metadata.name} | {tokenInfo.interface}
              </h2>

              <div className="flex items-center gap-1">
                <p className="text-sm">{tokenInfo.id}</p>
                <CopyPaste content={tokenInfo.id} />
              </div>

              <div className="border border-green-500 my-1 p-2 rounded-lg">
                <h3 className="text-md font-mono font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                  Description
                </h3>
                {tokenInfo && tokenInfo.content?.metadata?.description && (
                  <div className="mt-2">
                    <p className="font-mono font-semibold text-base text-gray-300 max-h-24 overflow-y-auto">
                      {tokenInfo.content?.metadata.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-green-500 mt-5 p-2 rounded-lg">
                <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                  Collection Stats
                </h3>
                {nftCollectionStat ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        Floor Price
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {nftCollectionStat?.floorPrice}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        24H Volume
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {nftCollectionStat?.volume24hr}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        24H SALES
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {nftCollectionStat?.txns24hr}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        all volume
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {nftCollectionStat?.volumeAll}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        Listed
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {nftCollectionStat?.listedCount}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        royalties
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {tokenInfo.royalty?.percent
                          ? tokenInfo.royalty.percent * 100
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        holders
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {nftCollectionStat?.holders}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                      <div className="text-sm text-green-500 mb-1 font-mono uppercase">
                        supply
                      </div>
                      <div className="text-sm font-mono group-hover: transition-colors">
                        {nftCollectionStat?.supply}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-[178px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Loader2 className="h-10 w-10 animate-spin" />
        )}
      </div>

      <div className="flex flex-row gap-3 mt-[50px]">
        <p className="font-mono text-sm py-1 cursor-pointer uppercase font-bold text-green-500 border-b border-b-green-500">
          NFTS
        </p>
      </div>

      <div className="mt-6 border border-green-500 rounded-lg p-2">
        {nfts.length ? (
          <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50 hover-scroll-indicator">
            <NFTShowcase nfts={nfts} isLoading={isLoading} error={error} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}

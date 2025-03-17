'use client'

import { LoadMoreObserver } from '@/components/load-more-observer'
import { useMagicEdenNFTs } from '@/hooks/use-magic-eden-nfts'
import { useCallback, useEffect, useState } from 'react'
import NFTShowcase from './nft-showcase'

interface NFTShowcaseContainerProps {
  walletAddress: string
}

export function NFTShowcaseContainer({
  walletAddress,
}: NFTShowcaseContainerProps) {
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const { nfts, isLoading, error } = useMagicEdenNFTs(walletAddress)

  // Initial load
  useEffect(() => {
    setPage(1)
    setHasMore(true)
  }, [walletAddress])

  // Load more function for infinite scrolling
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
    }
  }, [isLoading, hasMore, page])
  console.log({ nfts })

  return (
    <div className="space-y-4">
      <NFTShowcase nfts={nfts} isLoading={isLoading} error={error} />

      {hasMore && !error && (
        <LoadMoreObserver
          hasMore={hasMore}
          onLoadMore={loadMore}
          loading={isLoading}
        />
      )}
    </div>
  )
}

export default NFTShowcaseContainer

'use client'

import { useEffect, useRef } from 'react'

interface Props {
  hasMore: boolean
  onLoadMore: () => void
  loading: boolean
}

export function LoadMoreObserver({ hasMore, onLoadMore, loading }: Props) {
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { threshold: 1.0 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [hasMore, onLoadMore, loading])

  if (!hasMore) return null

  return (
    <div ref={observerRef} className="h-10 flex items-center justify-center">
      {loading ? (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      ) : (
        <div className="text-gray-500">Load more...</div>
      )}
    </div>
  )
}

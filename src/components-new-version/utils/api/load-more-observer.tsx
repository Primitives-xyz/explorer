'use client'

import { Spinner } from '@/components-new-version/ui'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

interface Props {
  hasMore: boolean
  loading: boolean
  renderAsLoader?: boolean
  onLoadMore: () => void
}

export function LoadMoreObserver({
  hasMore,
  loading,
  renderAsLoader,
  onLoadMore,
}: Props) {
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && !loading && hasMore) {
      const timeout = setTimeout(() => {
        onLoadMore()
      }, 50)

      return () => clearTimeout(timeout)
    }
  }, [inView, loading, hasMore, onLoadMore])

  const renderElement = () => {
    if (renderAsLoader) {
      return (
        <div ref={ref}>
          <Spinner className="w-full flex justify-center items-center mt-6" />
        </div>
      )
    } else {
      return <div ref={ref} className="w-px h-px" />
    }
  }

  if (hasMore) {
    return renderElement()
  } else {
    return null
  }
}

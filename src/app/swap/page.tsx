import { SwapPageClient } from '@/components/swap/components/swap-page-client'
import { Suspense } from 'react'

// Use Suspense to handle client component loading and search param reading
export default function SwapPage() {
  return (
    <Suspense fallback={<div>Loading Swap...</div>}>
      <SwapPageClient />
    </Suspense>
  )
}

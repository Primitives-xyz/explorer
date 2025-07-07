'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StatusBar } from '@/components/status-bar/status-bar'
import { Swap } from '@/components/swap/components/swap'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { SOL_MINT, SSE_MINT } from '@/utils/constants'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'

export function SwapPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { inputs, setInputs } = useSwapStore()

  // Sync URL params to store on initial mount
  useEffect(() => {
    const inputMintParam = searchParams.get('inputMint') || SOL_MINT
    const outputMintParam = searchParams.get('outputMint') || SSE_MINT
    // Optionally read amount from URL if needed, otherwise use store default
    const inputAmountParam = parseFloat(
      searchParams.get('amount') || inputs.inputAmount.toString() || '0'
    )

    setInputs({
      inputMint: inputMintParam,
      outputMint: outputMintParam,
      inputAmount: inputAmountParam,
    })
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Function to update URL from store state
  const updateUrlFromStore = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('inputMint', inputs.inputMint)
    params.set('outputMint', inputs.outputMint)
    // Optionally write amount to URL
    // params.set('amount', inputs.inputAmount.toString())

    // Use replace to avoid adding to browser history for every state change
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [inputs.inputMint, inputs.outputMint, searchParams, router, pathname])

  // Sync store changes back to URL
  useEffect(() => {
    updateUrlFromStore()
  }, [inputs.inputMint, inputs.outputMint, updateUrlFromStore])

  return (
    <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto flex justify-center">
      {/* Render the main Swap component, which now relies on the store */}
      <div className="w-[350px]">
        <StatusBar condensed={false} />
        <Swap />
      </div>
    </MainContentWrapper>
  )
}

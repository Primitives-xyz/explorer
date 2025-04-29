'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import {
  FilterType,
  TradeLeftContent,
} from '@/components/trade/left-content/trade-left-content'
import { TradeContent } from '@/components/trade/trade-content/trade-content'
import { SOL_MINT, SSE_MINT } from '@/utils/constants'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function TradePage() {
  const [tokenMint, setTokenMint] = useState<string>('')
  const [selectedType, setSelectedType] = useState<FilterType>(FilterType.SWAP)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { inputs, setInputs } = useSwapStore()

  useEffect(() => {
    const inputMintParam = searchParams.get('inputMint') || SOL_MINT
    const outputMintParam = searchParams.get('outputMint') || SSE_MINT
    const inputAmountParam = parseFloat(
      searchParams.get('amount') || inputs.inputAmount.toString() || '0'
    )

    if (
      inputMintParam !== inputs.inputMint ||
      outputMintParam !== inputs.outputMint
    ) {
      setInputs({
        inputMint: inputMintParam,
        outputMint: outputMintParam,
        inputAmount: inputAmountParam,
      })
    }
  }, [])

  const updateUrlFromStore = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('inputMint', inputs.inputMint)
    params.set('outputMint', inputs.outputMint)

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [inputs.inputMint, inputs.outputMint, searchParams, router, pathname])

  useEffect(() => {
    const currentInput = searchParams.get('inputMint')
    const currentOutput = searchParams.get('outputMint')
    if (
      inputs.inputMint !== currentInput ||
      inputs.outputMint !== currentOutput
    ) {
      updateUrlFromStore()
    }
  }, [inputs.inputMint, inputs.outputMint, searchParams, updateUrlFromStore])

  return (
    <MainContentWrapper className="flex flex-col md:flex-row w-full gap-6 pb-10">
      <TradeLeftContent
        setTokenMint={setTokenMint}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <TradeContent id={tokenMint} selectedType={selectedType} />
    </MainContentWrapper>
  )
}

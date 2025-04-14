'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { TradeLeftContent } from '@/components/trade/left-content/trade-left-content'
import { TradeContent } from '@/components/trade/trade-content/trade-content'
import { useState } from 'react'

export default function Page() {
  const [tokenMint, setTokenMint] = useState<string>('')

  return (
    <MainContentWrapper className="flex w-full space-x-6 pb-10">
      <TradeLeftContent setTokenMint={setTokenMint} />
      <TradeContent id={tokenMint} />
    </MainContentWrapper>
  )
}

'use client'

import { useState } from 'react'
import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { TradeLeftContent } from '@/components-new-version/trade/left-content/trade-left-content'
import { TradeContent } from '@/components-new-version/trade/trade-content/trade-content'

export default function Page() {
  const [tokenMint, setTokenMint] = useState<string>("")

  return (
    <MainContentWrapper className="flex gap-6">
      <div className="w-full flex space-x-6">
        <TradeLeftContent mint={tokenMint} setTokenMint={setTokenMint} />
        <TradeContent id={tokenMint} />
      </div>
    </MainContentWrapper>
  )
}

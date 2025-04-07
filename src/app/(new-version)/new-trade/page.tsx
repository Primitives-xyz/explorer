'use client'

import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { TradeLeftContent } from '@/components-new-version/trade/left-content/trade-left-content'
import { TradeContent } from '@/components-new-version/trade/trade-content/trade-content'
import { useState } from 'react'

export default function Page() {
  const [tokenMint, setTokenMint] = useState<string>('')

  return (
<<<<<<< HEAD
    <MainContentWrapper className="flex w-full space-x-6">
=======
    <MainContentWrapper className="flex w-full space-x-6 pb-10">
>>>>>>> main
      <TradeLeftContent mint={tokenMint} setTokenMint={setTokenMint} />
      <TradeContent id={tokenMint} />
    </MainContentWrapper>
  )
}

'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StatusBar } from '@/components/status-bar/status-bar'
import { MobileSwapTray } from '@/components/swap/components/mobile-swap-tray'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { SimpleInventoryModal } from '@/components/trenches/simple-inventory-modal'
import { TrenchesContent } from '@/components/trenches/trenches-content'
import { SOL_MINT } from '@/utils/constants'
import { useIsMobile } from '@/utils/use-is-mobile'
import { useState } from 'react'

export default function Trenches() {
  const { isMobile } = useIsMobile()
  const [showInventory, setShowInventory] = useState(false)
  const [currency, setCurrency] = useState<'SOL' | 'USD'>('USD')

  const { price: solPrice } = useTokenUSDCPrice({
    tokenMint: SOL_MINT,
    decimals: 9,
  })

  return (
    <MainContentWrapper>
      <StatusBar condensed />
      <TrenchesContent
        currency={currency}
        setCurrency={setCurrency}
        onOpenInventory={() => setShowInventory(true)}
      />
      {isMobile ? <MobileSwapTray /> : <SwapTray />}

      {/* Inventory Modal - Stable at page level */}
      <SimpleInventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        currency={currency}
        solPrice={solPrice}
      />
    </MainContentWrapper>
  )
}

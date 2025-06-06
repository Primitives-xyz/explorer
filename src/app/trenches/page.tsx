'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { MobileSwapTray } from '@/components/swap/components/mobile-swap-tray'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { SimpleInventoryModal } from '@/components/trenches/simple-inventory-modal'
import { TrenchesContent } from '@/components/trenches/trenches-content'
import { SOL_MINT } from '@/utils/constants'
import { useIsMobile } from '@/utils/use-is-mobile'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
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

      {/* Floating Inventory Button - Bottom Left */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowInventory(true)}
        className="fixed bottom-20 left-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg flex items-center justify-center z-[60]"
      >
        <Package className="w-6 h-6 text-white" />
      </motion.button>
    </MainContentWrapper>
  )
}

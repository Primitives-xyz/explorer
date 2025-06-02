'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { Button } from '@/components/ui/button'
import { SOL_MINT } from '@/utils/constants'
import { formatPriceWithCurrency } from '@/utils/format-price'
import { useIsMobile } from '@/utils/use-is-mobile'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AnimatePresence, motion, PanInfo } from 'framer-motion'
import { Activity, ArrowLeft, Clock, TrendingUp, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { TokenBadges } from './token-badges'
import { TokenBondedBar } from './token-bonded-bar'
import { TokenBuySellBar } from './token-buy-sell-bar'
import type { MintAggregate } from './trenches-types'

interface TokenDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  agg: MintAggregate | null
  currency: 'SOL' | 'USD'
  solPrice: number | null
}

export function TokenDetailsModal({
  isOpen,
  onClose,
  agg,
  currency,
  solPrice,
}: TokenDetailsModalProps) {
  const { setOpen, setInputs } = useSwapStore()
  const modalRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useIsMobile()
  const [isExiting, setIsExiting] = useState(false)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleClose = () => {
    if (isMobile) {
      setIsExiting(true)
      setTimeout(() => {
        onClose()
        setIsExiting(false)
      }, 300) // Match animation duration
    } else {
      onClose()
    }
  }

  if (!agg || !isOpen) return null

  const handleTrade = (amount: number) => {
    setOpen(true)
    setTimeout(() => {
      setInputs({
        inputMint: SOL_MINT,
        outputMint: agg.mint,
        inputAmount: amount,
      })
    }, 0)
  }

  const lastTrade = agg.lastTrade?.eventData?.tradeEvents?.[0]
  const topWallets = agg.topWallets || []
  const totalVolume = agg.volumePerToken || 0
  const realSolReserves = Number(
    agg.realSolReserves || lastTrade?.realSolReserves || 0
  )
  const pricePerToken = agg.pricePerToken || 0
  const volumeInSol = totalVolume / LAMPORTS_PER_SOL

  // Calculate market cap (assuming total supply of 1B tokens for pump.fun tokens)
  const totalSupply = 1_000_000_000
  const marketCapInSol = pricePerToken * totalSupply
  const marketCapInUsd = solPrice ? marketCapInSol * solPrice : 0

  // Calculate time since launch
  const timeSinceLaunch = agg.tokenCreatedAt
    ? Date.now() / 1000 - agg.tokenCreatedAt
    : null
  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Count buy/sell transactions from trades array
  const buyTxCount =
    agg.trades?.filter((trade) =>
      trade.eventData?.tradeEvents?.some((event) => event.isBuy)
    ).length || 0

  const sellTxCount =
    agg.trades?.filter((trade) =>
      trade.eventData?.tradeEvents?.some((event) => !event.isBuy)
    ).length || 0

  // Alternative: Use wallet volumes if trades array is not available
  const walletCount = Object.keys(agg.walletVolumes || {}).length

  const formatPrice = (priceInSol: number) => {
    return formatPriceWithCurrency(priceInSol, currency, solPrice)
  }

  const formatVolume = (volInSol: number) => {
    if (currency === 'USD' && solPrice) {
      const volInUsd = volInSol * solPrice
      return `$${volInUsd.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`
    }
    return `${volInSol.toLocaleString(undefined, {
      maximumFractionDigits: 4,
    })} SOL`
  }

  const formatMarketCap = () => {
    if (currency === 'USD' && marketCapInUsd) {
      return `$${marketCapInUsd.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`
    }
    return `${marketCapInSol.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} SOL`
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isMobile ? '' : 'flex items-center justify-center px-4'
          }`}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            ref={modalRef}
            initial={{
              opacity: 0,
              x: isMobile ? '100%' : 0,
              scale: isMobile ? 1 : 0.95,
            }}
            animate={{
              opacity: 1,
              x: isExiting && isMobile ? '100%' : 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: isMobile ? '100%' : 0,
              scale: isMobile ? 1 : 0.95,
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            dragTransition={{ power: 0, timeConstant: 0 }}
            onDragEnd={(e, { offset, velocity }: PanInfo) => {
              // If dragged more than 100px or with velocity > 500, dismiss
              if (offset.x > 100 || velocity.x > 500) {
                handleClose()
              }
            }}
            className={`relative bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl ${
              isMobile
                ? 'w-screen h-screen overflow-hidden flex flex-col'
                : 'max-w-2xl w-full max-h-[90vh] rounded-xl overflow-hidden'
            }`}
            style={isMobile ? { width: '100vw', height: '100vh' } : undefined}
          >
            {/* Header - Fixed */}
            <div className="bg-black/50 backdrop-blur-md border-b border-white/10 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}
                  {agg.mintImage && (
                    <img
                      src={agg.mintImage}
                      alt={agg.mintSymbol || 'Token'}
                      className="w-12 h-12 rounded-full ring-2 ring-white/20"
                    />
                  )}
                  <div>
                    <div className="font-bold text-xl">
                      {agg.mintSymbol || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {agg.mintName || 'Unknown Token'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {timeSinceLaunch && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {formatTimeSince(timeSinceLaunch)}
                    </div>
                  )}
                  {!isMobile && (
                    <button
                      onClick={handleClose}
                      className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div
              className={`overflow-y-auto flex-1 p-4 md:p-6 space-y-4 ${
                isMobile ? 'pb-24' : ''
              }`}
            >
              {/* Price and Main Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur p-4 rounded-xl border border-green-500/30">
                  <div className="text-xs text-gray-400 mb-1">Price</div>
                  <div className="font-bold text-xl text-green-400">
                    {formatPrice(pricePerToken)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur p-4 rounded-xl border border-blue-500/30">
                  <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                  <div className="font-bold text-xl text-blue-400">
                    {formatMarketCap()}
                  </div>
                </div>
              </div>

              {/* Token Address - Moved up and made more prominent */}
              <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Contract Address
                  </span>
                  <SolanaAddressDisplay
                    address={agg.mint}
                    showCopyButton
                    displayAbbreviatedAddress
                    className="text-sm font-mono"
                    fullAddressOnHover={false}
                  />
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">24h Volume</div>
                  <div className="font-semibold">
                    {formatVolume(volumeInSol)}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">
                    Real Liquidity
                  </div>
                  <div className="font-semibold">
                    {formatVolume(realSolReserves / LAMPORTS_PER_SOL)}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Activity size={12} />
                    TPS
                  </div>
                  <div className="font-semibold">
                    {agg.tps?.toFixed(2) || '0'}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Users size={12} />
                    Holders
                  </div>
                  <div className="font-semibold">
                    {agg.uniqueTraders?.size || 0}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <TokenBadges agg={agg} />
              </div>

              {/* Buy/Sell Activity - Enhanced */}
              <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 backdrop-blur rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    Trading Activity
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-400">{buyTxCount} buys</span>
                    <span className="text-gray-500">vs</span>
                    <span className="text-red-400">{sellTxCount} sells</span>
                  </div>
                </div>
                <TokenBuySellBar
                  totalBuy={agg.totalBuy}
                  totalSell={agg.totalSell}
                  decimals={agg.decimals ?? 9}
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>
                    Buy Volume: {formatVolume(agg.totalBuy / LAMPORTS_PER_SOL)}
                  </span>
                  <span>
                    Sell Volume:{' '}
                    {formatVolume(agg.totalSell / LAMPORTS_PER_SOL)}
                  </span>
                </div>
              </div>

              {/* Bonding Progress - Enhanced */}
              <div className="bg-gradient-to-br from-orange-900/10 to-red-900/10 backdrop-blur rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    Bonding Curve Progress
                  </span>
                  <span className="text-xs text-orange-400">
                    {((agg.bondingProgress || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <TokenBondedBar
                  realSolReserves={realSolReserves}
                  LAMPORTS_PER_SOL={LAMPORTS_PER_SOL}
                  bondingProgress={agg.bondingProgress}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {formatVolume(realSolReserves / LAMPORTS_PER_SOL)} / 74 SOL
                  {agg.aboutToGraduate && (
                    <span className="ml-2 text-yellow-400">
                      🎓 About to graduate!
                    </span>
                  )}
                </div>
              </div>

              {/* Top Holders */}
              {topWallets.length > 0 && (
                <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-400">Top Holders</span>
                  </div>
                  <div className="space-y-2">
                    {topWallets.slice(0, 5).map((wallet, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <SolanaAddressDisplay
                          address={wallet.wallet}
                          displayAbbreviatedAddress
                          showCopyButton={false}
                          className="text-sm"
                        />
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {((wallet.totalVolume / totalVolume) * 100).toFixed(
                              2
                            )}
                            %
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatVolume(
                              wallet.totalVolume / LAMPORTS_PER_SOL
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trade Buttons - Fixed on mobile */}
              <div
                className={`grid grid-cols-3 gap-3 ${isMobile ? 'pb-4' : ''}`}
              >
                <Button
                  onClick={() => handleTrade(0.1)}
                  variant="outline"
                  className="h-12 bg-green-600/20 hover:bg-green-600/30 border-green-500/50 text-green-400"
                >
                  Buy 0.1 SOL
                </Button>
                <Button
                  onClick={() => handleTrade(0.5)}
                  variant="outline"
                  className="h-12 bg-green-600/20 hover:bg-green-600/30 border-green-500/50 text-green-400"
                >
                  Buy 0.5 SOL
                </Button>
                <Button
                  onClick={() => handleTrade(1)}
                  className="h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Buy 1 SOL
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { TokenRow } from '@/components/trenches/trenches-components'
import { Skeleton } from '@/components/ui/skeleton'
import { useAutoTradeLogger } from '@/hooks/use-auto-trade-logger'
import { SOL_MINT } from '@/utils/constants'
import { useIsMobile } from '@/utils/use-is-mobile'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Pause,
  Play,
  Rocket,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FloatingActionDock } from './floating-action-dock'
import { HotFeedModal } from './hot-feed-modal'
import { TokenDetailsModal } from './token-details-modal'
import { TrenchesHotZone } from './trenches-hot-zone'
import { TrenchesLeaderboard } from './trenches-leaderboard'
import { MintAggregate } from './trenches-types'

type SectionType = 'newly_minted' | 'about_to_graduate' | 'recently_graduated'

interface TrenchesContentProps {
  currency: 'SOL' | 'USD'
  setCurrency: (currency: 'SOL' | 'USD') => void
  onOpenInventory: () => void
}

export function TrenchesContent({
  currency,
  setCurrency,
  onOpenInventory,
}: TrenchesContentProps) {
  const { isMobile } = useIsMobile()
  const { setOpen, setInputs, open } = useSwapStore()
  const [mintMap, setMintMap] = useState<Record<string, MintAggregate>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const [disableAnimations, setDisableAnimations] = useState(true)
  const [pauseUpdates, setPauseUpdates] = useState(false)
  const pausedMintMapRef = useRef<Record<string, MintAggregate>>({})
  const [selectedToken, setSelectedToken] = useState<MintAggregate | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHotFeed, setShowHotFeed] = useState(false)
  const [activeSection, setActiveSection] =
    useState<SectionType>('newly_minted')
  const [clickedTokenForHotFeed, setClickedTokenForHotFeed] =
    useState<MintAggregate | null>(null)

  // Inventory tracking removed - now handled by database

  const { price: solPrice, loading: solPriceLoading } = useTokenUSDCPrice({
    tokenMint: SOL_MINT,
    decimals: 9,
  })

  // Websocket message handler
  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'MintMapSnapshot') {
        const newData = msg.data
        setMintMap(newData)
        if (!pauseUpdates) {
          pausedMintMapRef.current = newData
        }
        // Price updates now handled by database via auto-trade-logger
      } else if (msg.type === 'MintAggregateUpdate') {
        setMintMap((prev) => {
          const updated = {
            ...prev,
            [msg.data.mint]: msg.data,
          }
          if (!pauseUpdates) {
            pausedMintMapRef.current = updated
          }
          return updated
        })
        // Price updates now handled by database via auto-trade-logger
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  useEffect(() => {
    const ws = new window.WebSocket(
      process.env.NEXT_PUBLIC_LASERSTREAM_WEBSOCKET ||
        'wss://laserstream.fly.dev'
    )
    wsRef.current = ws

    ws.onmessage = handleWebSocketMessage
    ws.onerror = () => {}
    ws.onclose = () => {}

    return () => {
      ws.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Use paused data when updates are paused
  const displayMintMap = pauseUpdates ? pausedMintMapRef.current : mintMap

  // Trade tracking now handled by auto-trade-logger

  // Automatically log trades to Tapestry backend
  useAutoTradeLogger({ platform: 'trenches' })

  // Memoize token filtering and sorting
  const { cookingToken, topRunnerUps, sectionTokens } = useMemo(() => {
    const now = Date.now() / 1000
    let tokens = Object.values(displayMintMap)
    // Sort by TPS descending for all views
    tokens = tokens.sort((a, b) => (b.tps || 0) - (a.tps || 0))

    // Get the top tokens
    const cookingToken = tokens[0]
    const topRunnerUps = tokens.slice(1, 5) // Top 4 runner-ups (#2-#5)

    // Filter for each section
    const graduatedMints = new Set(
      tokens.filter((agg) => agg.fullyBonded).map((agg) => agg.mint)
    )
    const aboutToGraduateMints = new Set(
      tokens
        .filter((agg) => !graduatedMints.has(agg.mint) && agg.aboutToGraduate)
        .map((agg) => agg.mint)
    )

    const newlyMinted = tokens
      .filter(
        (agg) =>
          !graduatedMints.has(agg.mint) &&
          !aboutToGraduateMints.has(agg.mint) &&
          (agg as any).tokenCreatedAt &&
          now - (agg as any).tokenCreatedAt < 3600
      )
      .slice(0, 20)

    const aboutToGraduate = tokens
      .filter((agg) => aboutToGraduateMints.has(agg.mint))
      .slice(0, 20)

    const recentlyGraduated = tokens
      .filter((agg) => graduatedMints.has(agg.mint))
      .slice(0, 20)

    return {
      cookingToken,
      topRunnerUps,
      sectionTokens: {
        newly_minted: newlyMinted,
        about_to_graduate: aboutToGraduate,
        recently_graduated: recentlyGraduated,
      },
    }
  }, [displayMintMap])

  // Helper for price display
  const solPriceDisplay = solPriceLoading
    ? '...'
    : solPrice
    ? `$${solPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '--'

  const handleTokenClick = (agg: MintAggregate) => {
    // Set the clicked token and open hot feed
    setClickedTokenForHotFeed(agg)
    setShowHotFeed(true)
  }

  const handleDirectBuy = (mint: string, amount: number) => {
    // Track the intended purchase
    const token = displayMintMap[mint]
    if (token) {
      // We'll track this as a pending transaction and update when confirmed
      // For now, just open the swap
    }

    setOpen(true)
    setTimeout(() => {
      setInputs({
        inputMint: SOL_MINT,
        outputMint: mint,
        inputAmount: amount,
        platform: 'trenches',
      })
    }, 0)
  }

  const sectionInfo = useMemo(
    () => ({
      newly_minted: {
        icon: <Sparkles className="w-4 h-4" />,
        label: 'Newly Minted',
        color: 'text-cyan-400',
      },
      about_to_graduate: {
        icon: <Rocket className="w-4 h-4" />,
        label: 'About to Graduate',
        color: 'text-yellow-400',
      },
      recently_graduated: {
        icon: <GraduationCap className="w-4 h-4" />,
        label: 'Recently Graduated',
        color: 'text-green-400',
      },
    }),
    []
  )

  return (
    <div
      className={`flex flex-col w-full justify-center items-center py-2 gap-2${
        isMobile ? ' px-2' : ''
      }`}
    >
      {/* Title Banner */}
      <div className="w-full max-w-7xl mb-4">
        <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30">
          {/* Title Row */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl flex-shrink-0">🪖</span>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent whitespace-nowrap">
              SSE TRENCHES
            </h1>
          </div>
          {/* Controls Row */}
          <div className="flex items-center gap-2">
            {/* Pause Button */}
            <button
              onClick={() => setPauseUpdates(!pauseUpdates)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                pauseUpdates
                  ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
              aria-label={pauseUpdates ? 'Resume updates' : 'Pause updates'}
            >
              {pauseUpdates ? <Play size={14} /> : <Pause size={14} />}
              <span className="hidden sm:inline">
                {pauseUpdates ? 'Resume' : 'Pause'}
              </span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4">
              {/* Currency Toggle */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Display prices in:</span>
                <div className="flex items-center gap-1 bg-black/20 rounded-md p-1">
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2 py-1 rounded transition-all ${
                      currency === 'USD'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrency('SOL')}
                    className={`px-2 py-1 rounded transition-all ${
                      currency === 'SOL'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    SOL
                  </button>
                </div>
                {currency === 'USD' && (
                  <span className="text-gray-500">
                    (1 SOL = {solPriceDisplay})
                  </span>
                )}
              </div>

              {/* Disable Animations */}
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={disableAnimations}
                  onChange={(e) => setDisableAnimations(e.target.checked)}
                  className="accent-primary w-3 h-3"
                />
                <span className="text-gray-400">Disable animations</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl space-y-3">
        {/* Trenches Leaderboard */}
        <TrenchesLeaderboard currency={currency} solPrice={solPrice} />

        {/* Hot Zone */}
        <TrenchesHotZone
          cookingToken={cookingToken}
          topRunnerUps={topRunnerUps}
          currency={currency}
          solPrice={solPrice}
          onTokenClick={handleTokenClick}
          onDirectBuy={handleDirectBuy}
        />

        {/* Section Selector - Sticky on mobile */}
        <div
          className={`bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/10 ${
            isMobile ? 'sticky top-0 z-20 shadow-lg' : ''
          }`}
        >
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-1`}>
            {(Object.keys(sectionInfo) as SectionType[]).map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                  activeSection === section
                    ? `bg-white/10 ${sectionInfo[section].color} border border-current`
                    : 'bg-transparent text-gray-400 hover:bg-white/5'
                }`}
              >
                {sectionInfo[section].icon}
                <span>{sectionInfo[section].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10 min-h-[400px]">
          <div
            className={`grid ${
              isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
            } gap-2`}
          >
            {sectionTokens[activeSection].length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-full">
                    <Skeleton className="w-full h-[100px] rounded-lg bg-neutral-800" />
                  </div>
                ))
              : sectionTokens[activeSection].map((agg) => (
                  <TokenRow
                    key={agg.mint}
                    agg={agg}
                    onClick={() => handleTokenClick(agg)}
                    onBuy={handleDirectBuy}
                    createdAt={(agg as any).tokenCreatedAt}
                    volume={
                      ((agg as any).volumePerToken || 0) / LAMPORTS_PER_SOL
                    }
                    currency={currency}
                    solPrice={solPrice}
                  />
                ))}
          </div>
        </div>
      </div>

      {/* Token Details Modal */}
      <AnimatePresence>
        <TokenDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          agg={selectedToken}
          currency={currency}
          solPrice={solPrice}
        />
      </AnimatePresence>

      {/* Hot Feed Modal */}
      <HotFeedModal
        isOpen={showHotFeed}
        onClose={() => {
          setShowHotFeed(false)
          setClickedTokenForHotFeed(null)
        }}
        tokens={Object.values(displayMintMap)}
        currency={currency}
        solPrice={solPrice}
        onShowDetails={(token) => {
          // Hot feed modal now handles details internally
        }}
        initialToken={clickedTokenForHotFeed}
      />

      {/* Floating Action Dock */}
      <FloatingActionDock
        showHotFeed={showHotFeed}
        onToggleHotFeed={() => {
          setClickedTokenForHotFeed(null)
          setShowHotFeed(!showHotFeed)
        }}
        onOpenInventory={onOpenInventory}
      />
    </div>
  )
}

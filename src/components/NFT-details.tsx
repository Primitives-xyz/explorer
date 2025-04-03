'use client'

import { motion } from 'framer-motion'
import { DAS } from 'helius-sdk'
import { ExternalLink, Info, Loader2, Tag, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { CopyPaste } from '@/components/common/copy-paste'
import { TransactionSection } from '@/components/transaction-section'
import { useMagicEdenToken } from '@/hooks/use-magic-eden-token'
import { useNftBuy } from '@/hooks/use-nft-buy'
import { useNftCancelListing } from '@/hooks/use-nft-cancel-listing'
import type { NFTTokenInfo } from '@/types/Token'
import { magicEdenNFTToNFT } from '@/utils/nft/converters'
import { useCurrentWallet } from './auth/hooks/use-current-wallet'
import { NFTChangePriceModal } from './nft/nft-change-price-modal'
import { NFTListingModal } from './nft/nft-listing-modal'
import { TokenAddress } from './tokens/token-address'

enum NFTTab {
  Transaction = 'transaction',
  Technical = 'technical',
}

export default function NFTDetails({ tokenInfo }: { tokenInfo: NFTTokenInfo }) {
  const { walletAddress } = useCurrentWallet()
  const { token: magicEdenNFT, mutate: refreshNFTs } = useMagicEdenToken(
    tokenInfo.id
  )
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [isChangePriceModalOpen, setIsChangePriceModalOpen] = useState(false)

  const { handleNftCancelListing, showNftCancelLoading } = useNftCancelListing(
    magicEdenNFTToNFT(magicEdenNFT),
    refreshNFTs
  )
  const { handleNftBuy, showNftBuyLoading } = useNftBuy(
    magicEdenNFTToNFT(magicEdenNFT),
    refreshNFTs
  )
  const [activeTab, setActiveTab] = useState<NFTTab>(NFTTab.Technical)
  const [isHovered, setIsHovered] = useState(false)

  const nft = magicEdenNFTToNFT(magicEdenNFT)
  const isOwner = walletAddress === nft?.owner
  const isListed = nft?.marketplace?.listed
  const price = magicEdenNFT?.price

  const getTabStyle = (tab: NFTTab) => {
    const isActive = activeTab === tab
    return `relative px-6 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 ${
      isActive
        ? 'text-green-400 bg-green-950/40 shadow-lg shadow-green-950/20'
        : 'text-gray-400 hover:text-green-400 hover:bg-green-950/20'
    }`
  }

  const handleListForSale = () => {
    setIsListingModalOpen(true)
  }

  const handleChangePrice = () => {
    setIsChangePriceModalOpen(true)
  }

  const handleCancelListing = () => {
    handleNftCancelListing()
  }

  const renderTechnicalTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-green-500/10 shadow-xl">
        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
          <Info size={20} />
          Schema & RPC
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 rounded-xl bg-green-950/30 border border-green-500/20 hover:border-green-400/30 transition-all duration-200">
            <div className="text-sm text-green-400 mb-2 font-medium">
              Schema
            </div>
            <div className="font-mono text-sm text-gray-300">
              {tokenInfo.content.$schema?.toString() || 'NONE'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-green-950/30 border border-green-500/20 hover:border-green-400/30 transition-all duration-200">
            <div className="text-sm text-green-400 mb-2 font-medium">
              JSON RPC
            </div>
            <div className="font-mono text-sm text-gray-300">
              {tokenInfo.content.json_uri?.toString() || 'NONE'}
            </div>
          </div>
        </div>
      </div>

      {/* Compression Details */}
      <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-green-500/10 shadow-xl">
        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
          <Tag size={20} />
          Compression Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokenInfo.compression &&
            Object.keys(tokenInfo.compression).map((key, indx) => (
              <div
                key={indx}
                className="p-4 rounded-xl bg-green-950/30 border border-green-500/20 hover:border-green-400/30 transition-all duration-200"
              >
                <div className="text-sm text-green-400 mb-2 font-medium">
                  {key}
                </div>
                <div className="font-mono text-sm text-gray-300">
                  {tokenInfo.compression?.[
                    key as keyof typeof tokenInfo.compression
                  ]?.toString() || 'NONE'}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Files Section */}
      {tokenInfo.content.files && tokenInfo.content.files.length > 0 && (
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-green-500/10 shadow-xl">
          <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <ExternalLink size={20} />
            Files
          </h3>
          <div className="space-y-4">
            {tokenInfo.content.files.map((file: DAS.File, index: number) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-green-950/30 border border-green-500/20 hover:border-green-400/30 transition-all duration-200"
              >
                <div className="grid gap-3">
                  <div>
                    <span className="text-sm text-green-400 mb-2 font-medium block">
                      URI
                    </span>
                    <div className="font-mono text-sm text-gray-300">
                      {file.uri}
                    </div>
                  </div>
                  {file.cdn_uri && (
                    <div>
                      <span className="text-sm text-green-400 mb-2 font-medium block">
                        CDN URI
                      </span>
                      <div className="font-mono text-sm text-gray-300 break-all">
                        {file.cdn_uri}
                      </div>
                    </div>
                  )}
                  {file.mime && (
                    <div>
                      <span className="text-sm text-green-400 mb-2 font-medium block">
                        Type
                      </span>
                      <div className="font-mono text-sm text-gray-300">
                        {file.mime}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-linear-to-b from-green-950/40 via-black/90 to-black/95 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - NFT Image and Actions */}
          <div className="lg:w-2/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-8"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <div className="block lg:hidden mb-6">
                <h1 className="text-3xl font-bold text-green-400 mb-2">
                  {tokenInfo.content.metadata.name}
                </h1>
                <div className="flex items-center gap-2">
                  <TokenAddress address={tokenInfo.id} />
                </div>
              </div>

              {/* NFT Image with enhanced styling */}
              <motion.div
                className="rounded-2xl overflow-hidden bg-linear-to-b from-black/90 to-black/95 border border-green-800/40 shadow-xl relative group"
                whileHover={{
                  boxShadow: '0 25px 50px -12px rgba(0, 255, 170, 0.25)',
                  borderColor: 'rgba(0, 255, 170, 0.5)',
                }}
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent pointer-events-none z-10" />
                {tokenInfo.content.links?.image ? (
                  <Link
                    href={tokenInfo.content.links.image}
                    target="_blank"
                    className="block relative group"
                  >
                    <motion.img
                      src={tokenInfo.content.links.image}
                      alt={tokenInfo.content.metadata.symbol}
                      className="w-full object-cover transition-transform duration-300"
                      animate={{ scale: isHovered ? 1.05 : 1 }}
                      transition={{ duration: 0.4 }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement?.classList.add(
                          'min-h-[200px]',
                          'flex',
                          'items-center',
                          'justify-center'
                        )
                        target.insertAdjacentHTML(
                          'afterend',
                          `<div class="font-medium text-gray-400">Image failed to load</div>`
                        )
                      }}
                    />
                    <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-all duration-300" />
                  </Link>
                ) : (
                  <div className="min-h-[300px] flex items-center justify-center bg-green-950/20">
                    <div className="text-gray-400">No image available</div>
                  </div>
                )}

                {/* Price tag if listed */}
                {magicEdenNFT?.price && (
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-lg text-sm font-medium z-20 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/30 flex items-center justify-center">
                      <span className="text-green-400 text-xs">◎</span>
                    </div>
                    <span className="text-white font-bold">
                      {magicEdenNFT.price} SOL
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 space-y-4"
              >
                {/* Buy button if listed and not owner */}
                {isListed && !isOwner && price && (
                  <motion.button
                    className="w-full bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={showNftBuyLoading}
                    onClick={handleNftBuy}
                  >
                    {showNftBuyLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        <span>Buy Now for {price} SOL</span>
                      </>
                    )}
                  </motion.button>
                )}

                {/* Owner actions if listed */}
                {isOwner && isListed && (
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      className="bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleChangePrice}
                    >
                      Change Price
                    </motion.button>

                    <motion.button
                      className="bg-linear-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancelListing}
                      disabled={showNftCancelLoading}
                    >
                      {showNftCancelLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Cancel Listing'
                      )}
                    </motion.button>
                  </div>
                )}

                {/* List for Sale button if owned by user and not listed */}
                {isOwner && !isListed && (
                  <motion.button
                    className="w-full bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleListForSale}
                  >
                    List for Sale
                  </motion.button>
                )}
                {/* Description */}
                {tokenInfo.content?.metadata?.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-6 rounded-2xl bg-linear-to-b from-black/90 to-black/95 border border-green-800/40 shadow-xl"
                  >
                    <h3 className="text-lg font-semibold text-green-400 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {tokenInfo.content.metadata.description}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Details and Tabs */}
          <div className="lg:w-3/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="hidden lg:block mb-6">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-green-400 mb-3"
                >
                  {tokenInfo.content.metadata.name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <TokenAddress address={tokenInfo.id} />
                </motion.div>
              </div>

              {/* Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-linear-to-b from-black/90 to-black/95 border border-green-800/40 shadow-xl"
                whileHover={{
                  boxShadow: '0 15px 30px -10px rgba(0, 255, 170, 0.1)',
                  borderColor: 'rgba(0, 255, 170, 0.3)',
                }}
              >
                <h3 className="text-lg font-semibold text-green-400 mb-4">
                  Details
                </h3>
                <div className="space-y-4">
                  <DetailRow label="Owner" value={tokenInfo.ownership.owner} />
                  <DetailRow label="Mint Address" value={tokenInfo.id} />
                  <DetailRow
                    label="Collection"
                    value={
                      tokenInfo.grouping?.find(
                        (g: { group_key: string; group_value: string }) =>
                          g.group_key === 'collection'
                      )?.group_value || 'None'
                    }
                  />
                  <DetailRow
                    label="Token Standard"
                    value={tokenInfo.interface}
                    showCopy={false}
                  />
                  <DetailRow
                    label="Royalties"
                    value={`${
                      magicEdenNFT?.sellerFeeBasisPoints
                        ? magicEdenNFT.sellerFeeBasisPoints / 100
                        : 0
                    }%`}
                    showCopy={false}
                  />
                </div>
              </motion.div>

              {/* Attributes */}
              {tokenInfo.content.metadata.attributes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-6 rounded-2xl bg-linear-to-b from-black/90 to-black/95 border border-green-800/40 shadow-xl"
                  whileHover={{
                    boxShadow: '0 15px 30px -10px rgba(0, 255, 170, 0.1)',
                    borderColor: 'rgba(0, 255, 170, 0.3)',
                  }}
                >
                  <h3 className="text-lg font-semibold text-green-400 mb-4">
                    Attributes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tokenInfo.content.metadata.attributes.map(
                      (
                        attr: { trait_type: string; value: string },
                        index: number
                      ) => (
                        <motion.div
                          key={index}
                          className="p-4 rounded-xl bg-green-950/30 border border-green-500/20 hover:border-green-400/30 transition-all duration-200"
                          whileHover={{
                            y: -2,
                            borderColor: 'rgba(0, 255, 170, 0.4)',
                          }}
                        >
                          <div className="text-sm text-green-400 mb-2 font-medium">
                            {attr.trait_type}
                          </div>
                          <div className="font-medium text-gray-300">
                            {attr.value}
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tabs */}
              <div className="mt-8">
                <div className="flex gap-4 p-1 mb-6">
                  {Object.values(NFTTab).map((tab) => (
                    <motion.button
                      key={tab}
                      className={getTabStyle(tab)}
                      onClick={() => setActiveTab(tab)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6">
                  {activeTab === NFTTab.Technical && renderTechnicalTab()}
                  {activeTab === NFTTab.Transaction && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TransactionSection
                        walletAddress={tokenInfo.id}
                        hasSearched={true}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NFTListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        nft={magicEdenNFTToNFT(magicEdenNFT)}
        refreshNFTs={refreshNFTs}
      />

      <NFTChangePriceModal
        isOpen={isChangePriceModalOpen}
        onClose={() => setIsChangePriceModalOpen(false)}
        nft={magicEdenNFTToNFT(magicEdenNFT)}
        refreshNFTs={refreshNFTs}
      />
    </div>
  )
}

// Helper component for detail rows
function DetailRow({
  label,
  value,
  showCopy = true,
}: {
  label: string
  value: string
  showCopy?: boolean
}) {
  return (
    <Link href={`/${value}`}>
      <motion.div
        className="flex items-center justify-between gap-4 py-2 border-b border-green-500/10 last:border-0 cursor-pointer"
        whileHover={{ backgroundColor: 'rgba(0, 255, 170, 0.03)' }}
      >
        <div className="text-sm text-gray-400">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-400 font-medium">{value}</span>
          {showCopy && <CopyPaste content={value} />}
        </div>
      </motion.div>
    </Link>
  )
}

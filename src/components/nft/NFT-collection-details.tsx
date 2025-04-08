'use client'

// React and Next.js imports
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

// UI components and icons
import { CopyPaste } from '@/components/common/copy-paste'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity,
  BarChart3,
  DollarSign,
  ExternalLink,
  Loader2,
  Users,
} from 'lucide-react'

import { useNftCollection } from '@/hooks/use-nft-collection'
import { NftCollectionDetailProps } from '@/types/nft/magic-eden'
import { AnimatePresence, motion } from 'framer-motion'
import NFTShowcase from './nft-showcase'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  hover: {
    y: -5,
    boxShadow: '0 15px 30px -10px rgba(0, 255, 170, 0.3)',
    borderColor: 'rgba(0, 255, 170, 0.5)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

// Add StatCardSkeleton component
const StatCardSkeleton = () => (
  <motion.div
    variants={statCardVariants}
    className="bg-black/50 rounded-xl border border-green-800/40 overflow-hidden"
  >
    <div className="px-4 py-3 bg-linear-to-r from-green-900/30 to-transparent border-b border-green-800/30">
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-baseline gap-2">
        <Skeleton className="w-24 h-8" />
      </div>
      <div className="mt-1">
        <Skeleton className="w-32 h-4" />
      </div>
    </div>
  </motion.div>
)

export default function NFTCollectionDetail({
  id,
  tokenInfo,
}: NftCollectionDetailProps) {
  // Context hooks
  const t = useTranslations()

  // Use the new hook to fetch collection data
  const { nftCollectionStat, nfts, isLoading } = useNftCollection(id)

  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'nfts' | 'activity'>('nfts')

  return (
    <div className="py-6 px-4  mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full"
      >
        {tokenInfo ? (
          <div className="flex flex-col gap-8 md:flex-row h-full">
            {/* Collection Image and Info */}
            <motion.div variants={itemVariants} className="md:w-1/4">
              <div className="sticky top-4">
                {tokenInfo.content.links?.image ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative group overflow-hidden rounded-xl border border-green-800/40 bg-linear-to-br from-black/40 to-black/20"
                  >
                    <Link href={tokenInfo.content.links.image} target="_blank">
                      <div className="relative aspect-square ">
                        <Image
                          src={tokenInfo.content.links.image}
                          alt={tokenInfo.content.metadata.symbol}
                          className="rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority
                          onError={(
                            e: React.SyntheticEvent<HTMLImageElement>
                          ) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement?.classList.add(
                              'flex',
                              'items-center',
                              'justify-center',
                              'bg-linear-to-br',
                              'from-green-900/20',
                              'to-green-800/10'
                            )
                            target.insertAdjacentHTML(
                              'afterend',
                              `<div class="font-mono text-sm">Image failed to load</div>`
                            )
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <span className="text-white text-sm flex items-center gap-1">
                          <ExternalLink size={14} /> View Original
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={itemVariants}
                    className="aspect-square rounded-xl bg-linear-to-br from-green-900/20 to-green-800/10 flex items-center justify-center border border-green-800/40"
                  >
                    <div className="font-mono text-sm">No image available</div>
                  </motion.div>
                )}

                {/* Collection Info Card */}
                <motion.div
                  variants={itemVariants}
                  className="mt-4 bg-black/30 backdrop-blur-xs border border-green-800/40 rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-3 bg-linear-to-r from-green-900/30 to-transparent border-b border-green-800/30">
                    <h3 className="text-sm font-bold text-green-400 uppercase">
                      Collection Info
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h2 className="text-xl font-bold bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        {tokenInfo.content.metadata.name}
                      </h2>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-sm text-gray-400">{tokenInfo.id}</p>
                        <CopyPaste content={tokenInfo.id} />
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 leading-relaxed">
                      {tokenInfo.content?.metadata.description ||
                        'No description available'}
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-2">
                      {tokenInfo.content.links?.external_url && (
                        <Link
                          href={tokenInfo.content.links.external_url}
                          target="_blank"
                          className="px-3 py-1.5 bg-black/50 rounded-full border border-green-800/40 hover:border-green-500/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink size={12} />
                          Website
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats and Content */}
            <motion.div variants={itemVariants} className="md:w-3/4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? (
                  <>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                  </>
                ) : (
                  <>
                    {/* Floor Price */}
                    <motion.div
                      variants={statCardVariants}
                      whileHover="hover"
                      className="bg-black/50 rounded-xl border border-green-800/40 overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-linear-to-r from-green-900/30 to-transparent border-b border-green-800/30">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-green-400" />
                          <span className="text-xs font-medium text-green-400">
                            Floor Price
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            ◎ {nftCollectionStat?.floorPrice || '0'}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Volume */}
                    <motion.div
                      variants={statCardVariants}
                      whileHover="hover"
                      className="bg-black/50 rounded-xl border border-green-800/40 overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-linear-to-r from-green-900/30 to-transparent border-b border-green-800/30">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} className="text-green-400" />
                          <span className="text-xs font-medium text-green-400">
                            24h Volume
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            ◎ {nftCollectionStat?.volume24hr || '0'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-400">
                          {nftCollectionStat?.txns24hr || '0'} sales
                        </div>
                      </div>
                    </motion.div>

                    {/* Listed */}
                    <motion.div
                      variants={statCardVariants}
                      whileHover="hover"
                      className="bg-black/50 rounded-xl border border-green-800/40 overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-linear-to-r from-green-900/30 to-transparent border-b border-green-800/30">
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-green-400" />
                          <span className="text-xs font-medium text-green-400">
                            Listed
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            {nftCollectionStat?.listedCount || '0'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-400">
                          {(
                            ((nftCollectionStat?.listedCount || 0) /
                              (nftCollectionStat?.supply || 1)) *
                            100
                          ).toFixed(1)}
                          % of supply
                        </div>
                      </div>
                    </motion.div>

                    {/* Holders */}
                    <motion.div
                      variants={statCardVariants}
                      whileHover="hover"
                      className="bg-black/50 rounded-xl border border-green-800/40 overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-linear-to-r from-green-900/30 to-transparent border-b border-green-800/30">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-green-400" />
                          <span className="text-xs font-medium text-green-400">
                            Holders
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            {nftCollectionStat?.holders || '0'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-400">
                          {nftCollectionStat?.supply || '0'} total supply
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Tabs Navigation */}
              <motion.div
                variants={itemVariants}
                className="flex flex-row gap-6 mt-8 border-b border-green-800/30"
              >
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  onClick={() => setActiveTab('nfts')}
                  className={`font-medium text-sm py-2 px-1 relative ${
                    activeTab === 'nfts'
                      ? 'text-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  NFTS
                  {activeTab === 'nfts' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                    />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  onClick={() => setActiveTab('activity')}
                  className={`font-medium text-sm py-2 px-1 relative ${
                    activeTab === 'activity'
                      ? 'text-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  ACTIVITY
                  {activeTab === 'activity' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                    />
                  )}
                </motion.button>
              </motion.div>

              {/* Tab Content */}
              <motion.div variants={itemVariants} className="mt-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'nfts' ? (
                    <motion.div
                      key="nfts"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-black/30 backdrop-blur-xs border border-green-800/40 rounded-xl overflow-hidden"
                    >
                      {nfts.length ? (
                        <div className="overflow-y-auto grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
                          <NFTShowcase
                            nfts={nfts}
                            isLoading={isLoading}
                            error={error}
                            refreshNFTs={() => {}}
                          />
                        </div>
                      ) : (
                        <div className="flex h-[400px] items-center justify-center">
                          <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                          <p className="text-sm text-gray-400 ml-3">
                            Loading NFTs...
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="activity"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-black/30 backdrop-blur-xs border border-green-800/40 rounded-xl overflow-hidden p-6 min-h-[400px] flex items-center justify-center"
                    >
                      <p className="text-gray-400">Activity data coming soon</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
            <p className="text-sm text-gray-400 mt-4">
              Loading collection details...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

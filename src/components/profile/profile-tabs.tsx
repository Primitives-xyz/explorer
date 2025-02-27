'use client'

import NFTShowcase from '@/components/NFTShowcase'
import SocialHub from '@/components/SocialHub'
import TokenDashboard from '@/components/TokenDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useTargetWallet } from '@/hooks/use-target-wallet'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { TransactionSection } from '../transaction-section'
import { ProfileContentFeed } from './profile-content-feed'

interface ProfileTabsProps {
  username: string
}

export function ProfileTabs({ username }: ProfileTabsProps) {
  const { targetWalletAddress } = useTargetWallet(username)
  const [activeTab, setActiveTab] = useState('social')
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Tab options with icons for better mobile experience
  const tabOptions = [
    { id: 'social', label: 'Social' },
    { id: 'activity', label: 'Activity' },
    { id: 'nfts', label: 'NFTs' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'transactions', label: 'Tx' },
  ]

  return (
    <div className=" w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-10 bg-[#161616] border-b border-gray-800">
          <TabsList className="w-full flex bg-transparent px-0 rounded-none overflow-visible">
            {tabOptions.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 py-3 font-mono text-sm text-gray-400 border-b-2 border-transparent 
                  hover:text-gray-200 /40 transition-colors
                  data-[state=active]:border-green-700 data-[state=active]:text-green-300 
                  data-[state=active]/60 rounded-none"
              >
                {isMobile && tab.id === 'transactions' ? 'Tx' : tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="py-4 md:py-6 w-full"
            >
              <TabsContent value="social" className="mt-0 w-full">
                <div className="container mx-auto px-2 md:px-4">
                  <SocialHub username={username} />
                </div>
              </TabsContent>
              <TabsContent value="activity" className="mt-0 w-full">
                <div className="container mx-auto px-2 md:px-4">
                  <ProfileContentFeed username={username} />
                </div>
              </TabsContent>
              <TabsContent value="nfts" className="mt-0 w-full">
                <div className="container mx-auto px-2 md:px-4">
                  <NFTShowcase walletAddress={targetWalletAddress} />
                </div>
              </TabsContent>
              <TabsContent value="tokens" className="mt-0 w-full">
                <div className="container mx-auto px-2 md:px-4">
                  <TokenDashboard walletAddress={targetWalletAddress} />
                </div>
              </TabsContent>
              <TabsContent value="transactions" className="mt-0 w-full">
                <div className="container mx-auto px-2 md:px-4">
                  <TransactionSection
                    walletAddress={targetWalletAddress}
                    hasSearched={true}
                  />
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  )
}

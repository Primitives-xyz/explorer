'use client'

import AchievementsPanel from '@/components/AchievementsPanel'
import NFTShowcase from '@/components/NFTShowcase'
import SocialHub from '@/components/SocialHub'
import TokenDashboard from '@/components/TokenDashboard'
import TransactionHistory from '@/components/TransactionHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTargetWallet } from '@/hooks/use-target-wallet'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ProfileContentFeed } from './profile-content-feed'

interface ProfileTabsProps {
  username: string
}

export function ProfileTabs({ username }: ProfileTabsProps) {
  const { targetWalletAddress } = useTargetWallet(username)
  const [activeTab, setActiveTab] = useState('activity')

  return (
    <div className="bg-gray-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex overflow-x-auto bg-gray-900 border-b border-gray-800 px-0 rounded-none">
          {[
            'Activity',
            'NFTs',
            'Tokens',
            'Transactions',
            'Social',
            'Achievements',
          ].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase()}
              className="flex-1 min-w-[100px] py-3 font-mono text-sm text-gray-400 border-b-2 border-transparent 
              hover:text-gray-200 hover:bg-gray-800/40 transition-colors
              data-[state=active]:border-green-700 data-[state=active]:text-green-300 data-[state=active]:bg-gray-800/60 rounded-none"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="py-6"
          >
            <TabsContent value="activity" className="mt-0">
              <ProfileContentFeed username={username} />
            </TabsContent>
            <TabsContent value="nfts" className="mt-0">
              <div className="container mx-auto">
                <NFTShowcase walletAddress={targetWalletAddress} />
              </div>
            </TabsContent>
            <TabsContent value="tokens" className="mt-0">
              <div className="container mx-auto">
                <TokenDashboard walletAddress={targetWalletAddress} />
              </div>
            </TabsContent>
            <TabsContent value="transactions" className="mt-0">
              <div className="container mx-auto">
                <TransactionHistory walletAddress={targetWalletAddress} />
              </div>
            </TabsContent>
            <TabsContent value="social" className="mt-0">
              <div className="container mx-auto">
                <SocialHub username={username} />
              </div>
            </TabsContent>
            <TabsContent value="achievements" className="mt-0">
              <div className="container mx-auto">
                <AchievementsPanel username={username} />
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

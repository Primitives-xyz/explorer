'use client'

import { StakeData } from '@/components/stake/stake-data/stake-data'
import { AdvancedStakingInfo } from '@/components/stake/stake-details/advanced-staking-info'
import { BottomDetails } from '@/components/stake/stake-details/bottom-details'
import { TopDetails } from '@/components/stake/stake-details/top-details'
import { FilterTabs } from '@/components/ui'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { MigrationBanner } from './components/migration-banner'
import { StakingV2UnlockModal } from './components/staking-v2-unlock-modal'
import { useMigrationCheck } from './hooks/use-migration-check'
import { useStakeInfo } from './hooks/use-stake-info'

export enum StakeFilterType {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM_REWARDS = 'claim-rewards',
}

export function StakeContent() {
  const t = useTranslations('stake')
  const options = [
    { label: t('tabs.stake'), value: StakeFilterType.STAKE },
    { label: t('tabs.unstake'), value: StakeFilterType.UNSTAKE },
    { label: t('tabs.claim_rewards'), value: StakeFilterType.CLAIM_REWARDS },
  ]

  const [selectedType, setSelectedType] = useState<StakeFilterType>(
    StakeFilterType.STAKE
  )
  const [showContent, setShowContent] = useState(false)

  const [showV2Modal, setShowV2Modal] = useState(false)
  const [hasShownV2Modal, setHasShownV2Modal] = useState(false)

  const { stakeAmount, hasStaked, showUserInfoLoading, refreshUserInfo } =
    useStakeInfo({})

  // Check migration status
  const {
    needsMigration,
    isLoading: isMigrationLoading,
    oldAccountData,
  } = useMigrationCheck()

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Show V2 modal when migration is needed
  useEffect(() => {
    // Only show modal if:
    // 1. User needs migration (needsMigration is true)
    // 2. Migration check is complete (!isMigrationLoading)
    // 3. Haven't shown the modal yet in this session
    // Disabled: We now use the migration banner instead of automatic modal
    // if (needsMigration && !isMigrationLoading && !hasShownV2Modal) {
    //   setShowV2Modal(true)
    //   setHasShownV2Modal(true)
    // }
  }, [needsMigration, isMigrationLoading, hasShownV2Modal])

  const handleV2ModalSuccess = () => {
    // Refresh the user info after claiming
    refreshUserInfo()
  }

  // Use old account deposit amount if migration is needed, otherwise use current stake amount
  const modalStakeAmount =
    needsMigration && oldAccountData ? oldAccountData.deposit : stakeAmount

  return (
    <div className="flex flex-col w-full space-y-6 relative">
      {/* Migration Banner - Now positioned as overlay when migration is needed */}
      {needsMigration && !isMigrationLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <MigrationBanner
              hideWhenModalOpen={false}
              isModalOpen={showV2Modal}
              isOverlayMode={true}
            />
          </div>
        </div>
      )}

      {/* Main Content - Blurred when migration is needed */}
      <div
        className={`transition-all duration-500 ${
          needsMigration && !isMigrationLoading
            ? 'blur-sm pointer-events-none select-none'
            : ''
        }`}
      >
        {/* Migration Banner for non-critical display (when no migration needed) */}
        {(!needsMigration || isMigrationLoading) && (
          <MigrationBanner
            hideWhenModalOpen={false}
            isModalOpen={showV2Modal}
          />
        )}

        {/* Balanced Two-Column Layout */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10 transition-all duration-700 ${
            showContent
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Left Column - Dashboard (order-2 on mobile, order-1 on lg+) */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div className="transition-all duration-500 delay-100">
              <AdvancedStakingInfo />
            </div>

            {/* Benefits section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 delay-200">
              <TopDetails />
              <BottomDetails />
            </div>
          </div>

          {/* Right Column - Actions (order-1 on mobile, order-2 on lg+) */}
          <div className="lg:col-span-1 space-y-4 transition-all duration-500 delay-300 order-1 lg:order-2">
            <div className="lg:sticky lg:top-4 space-y-4 bg-muted/30 p-6 rounded-lg border border-border/20">
              <FilterTabs
                options={options}
                selected={selectedType}
                onSelect={setSelectedType}
              />
              <StakeData selectedType={selectedType} />
            </div>
          </div>
        </div>
      </div>

      <StakingV2UnlockModal
        open={showV2Modal}
        onOpenChange={setShowV2Modal}
        stakeAmount={modalStakeAmount}
        onSuccess={handleV2ModalSuccess}
      />
    </div>
  )
}

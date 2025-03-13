'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LeaderboardTable } from '../leaderboards/leaderboard-table'
import { JupiterSwapForm } from '../transactions/jupiter-swap-form'
import { StakingContainer } from './StakingContainer'

type ModeType = 'swap' | 'stake' | 'unstake' | 'claim'

export const Swap = () => {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<ModeType>('swap')

  // Initialize mode from URL query parameter on component mount
  useEffect(() => {
    const modeParam = searchParams.get('mode') as ModeType
    if (
      modeParam &&
      ['swap', 'stake', 'unstake', 'claim'].includes(modeParam)
    ) {
      setMode(modeParam)
    }
  }, [searchParams])

  // Update URL when mode changes
  const updateMode = (newMode: ModeType) => {
    setMode(newMode)

    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', newMode)

    // Update URL without refreshing the page
    router.push(`/trade?${params.toString()}`, { scroll: false })
  }

  const handleSwapBtnClick = () => {
    updateMode('swap')
  }

  const handleStakeBtnClick = () => {
    updateMode('stake')
  }

  const handleUnstakeBtnClick = () => {
    updateMode('unstake')
  }

  const handleClaimBtnClick = () => {
    updateMode('claim')
  }

  return (
    <div className="px-4 py-8 min-h-screen">
      <div className="mx-auto h-full">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          <div className="w-full lg:w-2/3">
            <div className="flex flex-row justify-start items-center gap-4 flex-wrap">
              <div
                className={`w-[100px] text-center border hover:bg-green-600/10 hover:scale-105 border-green-600 px-3 rounded-sm py-1 text-xl mb-4 ${
                  mode == 'swap' ? 'text-green-500' : 'text-violet-100'
                }  cursor-pointer`}
                onClick={handleSwapBtnClick}
              >
                {t('trade.swap_tokens')}
              </div>
              <div
                className={`w-[100px] text-center border hover:bg-green-600/10 hover:scale-105 border-green-600 px-3 rounded-sm py-1 text-xl mb-4 ${
                  mode == 'stake' ? 'text-green-500' : 'text-violet-100'
                } cursor-pointer`}
                onClick={handleStakeBtnClick}
              >
                {t('trade.stake')}
              </div>
              <div
                className={` text-center border hover:bg-green-600/10 hover:scale-105 border-green-600 px-3 rounded-sm py-1 text-xl mb-4 ${
                  mode == 'unstake' ? 'text-green-500' : 'text-violet-100'
                } cursor-pointer`}
                onClick={handleUnstakeBtnClick}
              >
                {t('trade.unstake')}
              </div>
              <div
                className={` text-center border hover:bg-green-600/10 hover:scale-105 border-green-600 px-3 rounded-sm py-1 text-xl mb-4 ${
                  mode == 'claim' ? 'text-green-500' : 'text-violet-100'
                } cursor-pointer`}
                onClick={handleClaimBtnClick}
              >
                {t('trade.claim_rewards')}
              </div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl shadow-xl border border-green-500/20">
              <div className="p-6">
                {mode === 'swap' ? (
                  <JupiterSwapForm hideWhenGlobalSearch />
                ) : (
                  <StakingContainer
                    mode={mode as 'stake' | 'unstake' | 'claim'}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4 text-violet-100">
              {t('top_traders.title')}
            </h2>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl shadow-xl border border-violet-500/20 overflow-auto ">
              <LeaderboardTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

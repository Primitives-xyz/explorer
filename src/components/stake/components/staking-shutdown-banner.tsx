'use client'

import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StakingShutdownBannerProps {
  isOverlayMode?: boolean
}

export function StakingShutdownBanner({
  isOverlayMode = false,
}: StakingShutdownBannerProps) {
  const t = useTranslations()

  // If in overlay mode, use modal-like design
  if (isOverlayMode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl shadow-2xl border-0 bg-background overflow-hidden mb-6"
      >
        {/* Gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-orange-900/80 to-slate-900 p-4 sm:p-6 text-white">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 h-48 w-48 animate-pulse rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-red-500/10 blur-3xl animation-delay-2000" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-300" />
                <div className="absolute inset-0 h-5 w-5 sm:h-6 sm:w-6 animate-ping rounded-full bg-orange-400/30" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                New Staking Temporarily Paused – Unstake Still Available
              </h2>
            </div>
            <p className="text-sm sm:text-base text-orange-100/90">
              New staking deposits are currently disabled for maintenance. Please unstake and claim all your rewards.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 bg-background">
          {/* Instructions */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 sm:p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              Next Steps
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <p>1. Switch to the &quot;Unstake&quot; tab to withdraw your staked SSE</p>
              <p>2. Switch to the &quot;Claim Rewards&quot; tab to claim all pending rewards</p>
              <p>
                3. Follow our announcement on{' '}
                <a
                  href="https://x.com/usetapestry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 underline"
                >
                  Twitter
                </a>{' '}
                for updates
              </p>
            </div>
          </div>

          {/* Notice */}
          <div className="p-2 sm:p-3 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/30">
            <p className="text-xs text-blue-200">
              ℹ️ Your funds remain safe. Unstaking and claiming rewards are fully
              operational.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Original banner design for non-overlay mode
  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm p-6 mb-6 border border-orange-500/30 shadow-xl">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-orange-400 mb-2">
              Staking Temporarily Paused
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              New staking deposits are currently disabled. Please unstake and
              claim all your rewards using the tabs below.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Use the &quot;Unstake&quot; tab to withdraw your staked SSE</p>
              <p>• Use the &quot;Claim Rewards&quot; tab to claim all pending rewards</p>
              <p>
                • Follow our{' '}
                <a
                  href="https://x.com/usetapestry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Twitter announcement
                </a>{' '}
                for updates
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-blue-500/20">
          <p className="text-sm text-blue-200">
            ℹ️ Your funds remain safe and secure. Unstaking and claiming rewards
            are fully operational.
          </p>
        </div>
      </div>
    </div>
  )
}

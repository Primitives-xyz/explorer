'use client'

import { OnboardingButton } from '@/components/onboarding/components/onboarding-button'
import { ScoreIndicator } from '@/components/scoring/score-indicator'
import { useGetBalance } from '@/components/tapestry/hooks/use-get-balance'
import { Skeleton } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/popover/dropdown-menu'
import { SSE_TOKEN_MINT } from '@/utils/constants'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { EllipsisVerticalIcon, LogOutIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
  setOpen?: (open: boolean) => void
}

export function ProfileInfos({ setOpen }: Props) {
  const t = useTranslations()
  const {
    mainProfile,
    isLoggedIn,
    walletAddress,
    logout,
    setShowAuthFlow,
    sdkHasLoaded,
  } = useCurrentWallet()
  const { balance, loading: balanceLoading } = useGetBalance({ walletAddress })

  // Use state to track if we're on the client and ready to show content
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    // Only set to true after hydration to avoid mismatch
    setIsClientReady(true)
  }, [])

  // Always show skeleton during SSR and initial client render
  // This ensures consistent rendering between server and client
  if (!isClientReady || !sdkHasLoaded || (isLoggedIn && !mainProfile)) {
    return <Skeleton className="w-full h-[36px]" />
  }

  if (!isLoggedIn) {
    return (
      <Button
        className="w-full"
        variant={ButtonVariant.OUTLINE_WHITE}
        onClick={() => setShowAuthFlow(true)}
      >
        {t('common.connect_wallet')}
      </Button>
    )
  }

  return (
    <div className="space-y-2 text-lg md:text-sm animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <Button
          className="flex items-center gap-2 p-0 hover:bg-transparent"
          variant={ButtonVariant.GHOST}
          href={route('entity', { id: mainProfile?.username || '' })}
          onClick={() => {
            setOpen && setOpen(false)
          }}
        >
          <Avatar
            className="w-8 md:w-6"
            username={mainProfile?.username || ''}
            imageUrl={mainProfile?.image}
            size={40}
          />
          <div className="flex items-center gap-1 text-lg md:text-sm">
            <p>{t('menu.profile.greeting')}</p>
            <p className="max-w-[8rem] truncate">
              {mainProfile?.username || ''}
            </p>
          </div>
        </Button>
        <div className="desktop">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={ButtonVariant.GHOST} size={ButtonSize.ICON_SM}>
                <EllipsisVerticalIcon size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-46">
              <DropdownMenuItem onClick={logout}>
                <LogOutIcon size={18} />
                {t('menu.profile.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          isInvisible
          onClick={() => {
            setOpen && setOpen(false)
          }}
          href={route('entity', {
            id: SSE_TOKEN_MINT,
          })}
        >
          <Image
            src="/images/sse.png"
            width={16}
            height={16}
            alt="icon"
            className="rounded-full aspect-square object-cover w-5 h-5 md:w-4 md:h-4"
          />
          <span className="text-primary">$SSE</span>
        </Button>
        <span className={balanceLoading ? 'animate-pulse' : ''}>
          {`${t('common.balance')}: ${balanceLoading ? '...' : balance}`}
        </span>
      </div>
      <ScoreIndicator className="w-full" />
      {!mainProfile?.hasSeenProfileSetupModal && !!mainProfile?.id && (
        <OnboardingButton profileId={mainProfile.id} />
      )}
    </div>
  )
}

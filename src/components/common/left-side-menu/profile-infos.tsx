'use client'

import { OnboardingButton } from '@/components/onboarding/components/onboarding-button'
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

interface Props {
  setOpen?: (open: boolean) => void
}

export function ProfileInfos({ setOpen }: Props) {
  const t = useTranslations()
  const {
    mainProfile,
    isLoggedIn,
    walletAddress,
    loading,
    logout,
    setShowAuthFlow,
  } = useCurrentWallet()
  const { balance } = useGetBalance({ walletAddress })

  if (loading) {
    return <Skeleton className="w-full h-[64px]" />
  }

  return (
    <div>
      {!isLoggedIn && (
        <Button
          className="w-full"
          variant={ButtonVariant.OUTLINE_WHITE}
          onClick={() => setShowAuthFlow(true)}
        >
          {t('common.connect_wallet')}
        </Button>
      )}
      {!!mainProfile && (
        <div className="space-y-4">
          <div className="space-y-2 text-lg md:text-sm">
            <div className="flex items-center justify-between">
              <Button
                className="flex items-center gap-2 p-0 hover:bg-transparent"
                variant={ButtonVariant.GHOST}
                href={route('entity', { id: mainProfile.username })}
                onClick={() => {
                  setOpen?.(false)
                }}
              >
                <Avatar
                  className="w-8 md:w-6"
                  username={mainProfile.username}
                  imageUrl={mainProfile.image}
                  size={40}
                />
                <div className="flex items-center gap-1 text-lg md:text-sm">
                  <p>{t('menu.profile.greeting')}</p>
                  <p className="max-w-[8rem] truncate">
                    {mainProfile.username}
                  </p>
                </div>
              </Button>
              <div className="desktop">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={ButtonVariant.GHOST}
                      size={ButtonSize.ICON_SM}
                    >
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
                  setOpen?.(false)
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
              <span>{`${t('common.balance')}: ${balance}`}</span>
            </div>
          </div>
          {!mainProfile.hasSeenProfileSetupModal && (
            <OnboardingButton username={mainProfile.username} />
          )}
        </div>
      )}
    </div>
  )
}

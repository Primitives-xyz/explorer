'use client'

import { useGetBalance } from '@/components/tapestry/hooks/use-get-balance'
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
import Image from 'next/image'

export function ProfileInfos() {
  const { mainProfile, isLoggedIn, walletAddress, logout, setShowAuthFlow } =
    useCurrentWallet()
  const { balance } = useGetBalance({ walletAddress })
  // const { enableMotion, setEnableMotion } = useMotionStore()

  return (
    <div>
      {!isLoggedIn && (
        <Button
          className="w-full"
          variant={ButtonVariant.OUTLINE_WHITE}
          onClick={() => setShowAuthFlow(true)}
        >
          Connect Wallet
        </Button>
      )}
      {!!mainProfile && (
        <div className="space-y-2 text-lg md:text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar
                className="w-8 md:w-6"
                username={mainProfile.username}
                imageUrl={mainProfile.image}
                size={40}
              />
              <p>hi</p>
              <p className="font-medium max-w-[8rem] truncate pr-1">
                {mainProfile.username}
              </p>
            </div>
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
                  {/* <DropdownMenuItem
                  onClick={() => setEnableMotion(!enableMotion)}
                >
                  <Checkbox checked={enableMotion} />
                  Enable animation
                </DropdownMenuItem> */}
                  <DropdownMenuItem onClick={logout}>
                    <LogOutIcon size={18} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              isInvisible
              href={route('entity', {
                id: SSE_TOKEN_MINT,
              })}
            >
              <Image
                src="/images/sse.png"
                width={16}
                height={16}
                alt="icon"
                className="rounded-full aspect-square object-cover"
              />
              <span className="text-primary">$SSE</span>
            </Button>
            <span>Bal: {balance}</span>
          </div>
        </div>
      )}
    </div>
  )
}

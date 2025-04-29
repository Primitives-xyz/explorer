'use client'

import { useMotionStore } from '@/components/motion/stores/use-motion-store'
import { useGetBalance } from '@/components/tapestry/hooks/use-get-balance'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui/button'
import { SSE_TOKEN_MINT } from '@/utils/constants'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { EllipsisVerticalIcon, LogOutIcon } from 'lucide-react'
import Image from 'next/image'

export function ProfileInfos() {
  const { mainProfile, isLoggedIn, walletAddress, logout, setShowAuthFlow } =
    useCurrentWallet()
  const { balance } = useGetBalance({ walletAddress })
  const { enableMotion, setEnableMotion } = useMotionStore()

  return (
    <div>
      {!isLoggedIn ? (
        <Button
          className="w-full"
          variant={ButtonVariant.OUTLINE_WHITE}
          onClick={() => setShowAuthFlow(true)}
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <p className="md:text-xs pr-1">hi</p>
            <p className="font-bold md:text-xs max-w-[4rem] truncate pr-1">
              {mainProfile?.username}
            </p>
            <p className="md:text-xs flex items-center gap-1">
              <span>|</span>
              <Button
                variant={ButtonVariant.GHOST}
                className="p-0 hover:bg-transparent"
                href={route('entity', { id: SSE_TOKEN_MINT })}
              >
                <span>
                  <Image
                    src="/images/sse.png"
                    width={16}
                    height={16}
                    alt="icon"
                    className="rounded-full aspect-square object-cover"
                  />
                </span>
                <span className="text-primary">$SSE </span>
              </Button>
              <span>Bal: {balance}</span>
            </p>
          </div>
          <div className="hidden flex:md">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={ButtonVariant.GHOST} size={ButtonSize.ICON_SM}>
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
      )}
    </div>
  )
}

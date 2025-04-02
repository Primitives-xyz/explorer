'use client'

import { useTokenBalance } from '@/components-new-version/tapestry/hooks/use-get-balance'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components-new-version/ui'
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/components-new-version/ui/button'
import { SSE_TOKEN_MINT } from '@/components-new-version/utils/constants'
import { route } from '@/components-new-version/utils/route'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { EllipsisVerticalIcon } from 'lucide-react'
import Image from 'next/image'

export function ProfileInfos() {
  const { mainProfile, isLoggedIn, walletAddress, logout, setShowAuthFlow } =
    useCurrentWallet()
  const { balance } = useTokenBalance({ walletAddress })

  return (
    <div>
      {!isLoggedIn ? (
        <Button
          expand
          variant={ButtonVariant.OUTLINE_WHITE}
          onClick={() => setShowAuthFlow(true)}
        >
          Connect wallet
        </Button>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <p className="text-xs pr-1">hi</p>
            <p className="font-bold text-xs max-w-28 truncate pr-1">
              {mainProfile?.username}
            </p>
            <p className="text-xs flex items-center gap-1">
              <span>|</span>
              <Button
                variant={ButtonVariant.GHOST}
                className="p-0 hover:bg-transparent"
                href={route('address', { id: SSE_TOKEN_MINT })}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={ButtonVariant.GHOST} size={ButtonSize.ICON_SM}>
                <EllipsisVerticalIcon size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={logout}>logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

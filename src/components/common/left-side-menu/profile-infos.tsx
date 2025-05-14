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

interface Props {
  setOpen?: (open: boolean) => void
}

export function ProfileInfos({ setOpen }: Props) {
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
            <Button
              className="flex items-center gap-2 p-0 hover:bg-transparent"
              variant={ButtonVariant.GHOST}
              href={route('entity', { id: mainProfile.username })}
              onClick={() => {
                setOpen && setOpen(false)
              }}
            >
              <Avatar
                className="w-8 md:w-6"
                username={mainProfile.username}
                imageUrl={mainProfile.image}
                size={40}
              />
              <div className="flex items-center gap-1 text-lg md:text-sm">
                <p>hi</p>
                <p className="max-w-[8rem] truncate">{mainProfile.username}</p>
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
            <span>Bal: {balance}</span>
          </div>
        </div>
      )}
    </div>
  )
}

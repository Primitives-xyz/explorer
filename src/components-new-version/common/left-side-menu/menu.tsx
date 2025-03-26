'use client'

import { useTokenBalance } from '@/components-new-version/tapestry/hooks/use-get-balance'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components-new-version/ui'
import { Button, ButtonVariant } from '@/components-new-version/ui/button'
import { SSE_TOKEN_MINT } from '@/components-new-version/utils/constants'
import { route } from '@/components-new-version/utils/route'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { cn } from '@/components-new-version/utils/utils'

import {
  ArrowRightLeft,
  Beef,
  CircleDollarSign,
  Compass,
  EllipsisVertical,
  House,
  PaintbrushVertical,
  User,
} from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function Menu() {
  const pathname = usePathname()
  const { mainUsername, isLoggedIn, walletAddress, logout, setShowAuthFlow } =
    useCurrentWallet()
  const { balance } = useTokenBalance({ walletAddress })

  const data = [
    {
      title: 'Home',
      icon: House,
      href: route('home'),
    },
    {
      title: 'Trade',
      icon: ArrowRightLeft,
      href: route('trade'),
    },
    {
      title: 'Discover',
      icon: Compass,
      href: route('discover'),
    },
    {
      title: 'Tokens',
      icon: CircleDollarSign,
      href: route('tokens'),
    },
    {
      title: 'Profile',
      icon: User,
      href: route('profile'),
    },
    {
      title: 'Stake',
      icon: Beef,
      href: route('profile'),
    },
    {
      title: 'Design System',
      icon: PaintbrushVertical,
      href: route('designSystem'),
    },
  ]

  return (
    <div className="flex flex-col space-y-2">
      <div className="pb-6 pt-10">
        {!isLoggedIn ? (
          <Button
            expand
            variant={ButtonVariant.OUTLINE_WHITE}
            onClick={() => setShowAuthFlow(true)}
          >
            connect wallet
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <p className="text-xs pr-1">hi</p>
              <p className="font-bold text-xs max-w-28 truncate pr-1">
                {mainUsername}
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
                <Button variant={ButtonVariant.GHOST} size="icon">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={logout}>logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {data.map((item, i) => (
        <Button
          key={i}
          variant={ButtonVariant.GHOST}
          className={cn(
            'justify-start gap-4 hover:bg-primary hover:text-background',
            pathname === item.href && 'bg-primary text-background'
          )}
          href={item.href}
        >
          <item.icon size={20} />
          {item.title}
        </Button>
      ))}
    </div>
  )
}

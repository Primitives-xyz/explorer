'use client'

import { useTokenBalance } from '@/components-new-version/tapestry/hooks/use-get-balance'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components-new-version/ui'
import { Button, ButtonVariant } from '@/components-new-version/ui/button'
import { route } from '@/components-new-version/utils/route'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { cn } from '@/components-new-version/utils/utils'

import {
  ArrowRightLeft,
  CircleDollarSign,
  EllipsisVertical,
  House,
  PaintbrushVertical,
  Search,
  User,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Menu() {
  const pathname = usePathname()
  const { mainUsername, walletAddress, logout, setShowAuthFlow } =
    useCurrentWallet()
  const { balance } = useTokenBalance({ walletAddress })

  const data = [
    {
      title: 'Home',
      icon: House,
      href: route('home'),
    },
    {
      title: 'Design System',
      icon: PaintbrushVertical,
      href: route('designSystem'),
    },
    {
      title: 'Trade',
      icon: ArrowRightLeft,
      href: route('trade'),
    },
    {
      title: 'Discover',
      icon: Search,
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
  ]

  return (
    <div className="flex flex-col space-y-2">
      <div className="pb-6 pt-10">
        {!walletAddress ? (
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
              <p className="text-xs pr-1">hi </p>
              <p className="font-bold text-xs max-w-28 truncate pr-1">
                {mainUsername}
              </p>
              <p className="text-xs">| $SSE Bal: ${balance}</p>
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

'use client'

import { Button, ButtonVariant } from '@/components-new-version/ui/button'
import { route } from '@/components-new-version/utils/route'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { cn } from '@/components-new-version/utils/utils'
import {
  ArrowRightLeft,
  Beef,
  CircleDollarSign,
  Compass,
  House,
  PaintbrushVertical,
  User,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Menu() {
  const pathname = usePathname()
  const { mainUsername } = useCurrentWallet()

  const data = [
    {
      title: 'Home',
      icon: House,
      href: route('home'),
    },
    {
      title: 'Trade',
      icon: ArrowRightLeft,
      href: route('newTrade'),
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
      href: route('entity', { id: mainUsername }),
    },
    {
      title: 'Stake',
      icon: Beef,
    },
    {
      title: 'Design System',
      icon: PaintbrushVertical,
      href: route('designSystem'),
    },
  ]

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <Button
          key={i}
          variant={ButtonVariant.GHOST}
          className={cn(
            'flex justify-start w-full gap-4 hover:bg-primary hover:text-background',
            {
              'bg-primary text-background': pathname === item.href,
            }
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

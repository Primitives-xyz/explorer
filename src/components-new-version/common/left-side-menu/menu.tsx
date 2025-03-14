'use client'

import { Button, ButtonVariant } from '@/components-new-version/ui/button'
import { route } from '@/components-new-version/utils/route'
import { cn } from '@/components-new-version/utils/utils'
import {
  ArrowRightLeft,
  CircleDollarSign,
  House,
  PaintbrushVertical,
  Search,
  User,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Menu() {
  const pathname = usePathname()

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

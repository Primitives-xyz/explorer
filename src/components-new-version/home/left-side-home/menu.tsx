'use client'

import { Button } from '@/components-new-version/ui/button'
import { route } from '@/components-new-version/utils/route'
import {
  ArrowRightLeft,
  CircleDollarSign,
  House,
  Search,
  User,
} from 'lucide-react'

export function Menu() {
  const data = [
    {
      title: 'Home',
      icon: House,
      href: route('home'),
    },
    {
      title: 'Trade',
      icon: ArrowRightLeft,
      href: route('home'),
    },
    {
      title: 'Discover',
      icon: Search,
      href: route('home'),
    },
    {
      title: 'Tokens',
      icon: CircleDollarSign,
      href: '/',
    },
    {
      title: 'Profile',
      icon: User,
      href: route('home'),
    },
  ]

  return (
    <div className="flex flex-col space-y-2">
      {data.map((item, i) => (
        <Button
          key={i}
          variant="ghost"
          className="justify-start gap-4"
          href={item.href}
        >
          <item.icon size={20} />
          {item.title}
        </Button>
      ))}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { clsx, type ClassValue } from 'clsx'
import { route } from '@/utils/routes'
import {
  ArrowRightLeft,
  Beef,
  CircleDollarSign,
  House,
  PaintbrushVertical,
  Search,
  User,
} from 'lucide-react'
import { useState } from 'react'

export function Menu() {
  const [clickedBtn, setClickedBtn] = useState<string | null>(null)

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
      href: route('swap'),
    },
    {
      title: 'Discover',
      icon: Search,
      href: route('home'),
    },
    {
      title: 'Tokens',
      icon: CircleDollarSign,
      href: route('trade'),
    },
    {
      title: 'Profile',
      icon: User,
      href: route('home'),
    },
    {
      title: 'Stake',
      icon: Beef,
      href: route('home'),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {data.map((item, i) => (
        <Link key={i} href={item.href}>
          <div
            className={`flex flex-row items-center gap-4 px-1 py-2 text-[#F5F8FD] text-[20px] font-bold leading-[150%] capitalize rounded-[6px] ${clsx((clickedBtn == item.title) && 'bg-[#97EF83] text-[#292C31]')} md:px-4`}
            onClick={() => {
              setClickedBtn(item.title)
              console.log(item.title)
            }}
          >
            <item.icon size={20} />
            <span className='hidden md:block'>{item.title}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

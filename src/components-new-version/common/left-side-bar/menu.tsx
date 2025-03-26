'use client'

import Link from 'next/link'
import { route } from '@/components-new-version/utils/route'
import {
  ArrowRightLeft,
  Beef,
  CircleDollarSign,
  Compass,
  House,
  PaintbrushVertical,
  Search,
  User,
  Wallet
} from 'lucide-react'
import { useState } from 'react'
import NavigationItem from './navigation-item'
import dynamic from 'next/dynamic'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

export function Menu() {
  const { walletAddress } = useCurrentWallet();
  const [activeItem, setActiveItem] = useState<string | null>(null)

  const navigationItems = [
    { title: 'Home', icon: House, href: route('home') },
    { title: 'Search', icon: Search, href: route('home') },
    { title: 'Trade', icon: ArrowRightLeft, href: route('swap') },
    { title: 'Discover', icon: Compass, href: route('home') },
    { title: 'Tokens', icon: CircleDollarSign, href: route('home') },
    { title: 'Profile', icon: User, href: route('home') },
    { title: 'Stake', icon: Beef, href: route('home') },
  ]

  return (
    <div className="flex flex-col gap-2">
      {navigationItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <NavigationItem
            key={item.title}
            title={item.title}
            icon={item.icon}
            isActive={activeItem === item.title}
            onClick={() => {
              setActiveItem(item.title)
              console.log(item.title)
            }}
          />
        </Link>
      ))}
      {
        !walletAddress && (
          <DynamicConnectButton>
            <div className="flex flex-row items-center gap-4 px-1 py-2 text-[#F5F8FD] text-[16px] font-bold leading-[150%] capitalize rounded-[6px] cursor-pointer transition-colors hover:text-[#97EF83] hover:scale-105 md:px-4">
              <Wallet size={20} />
              Connect Wallet
            </div>
          </DynamicConnectButton>
        )
      }
    </div>
  )
}

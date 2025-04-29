'use client'

import { DialectNotificationsComponent } from '@/components/notifications/dialect-notifications-component'
import { Button, ButtonVariant } from '@/components/ui/button'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import {
  ArrowRightLeft,
  Beef,
  Compass,
  House,
  LucideIcon,
  User,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { SearchButton } from '../../search/components/search-button'

export function Menu() {
  const { mainProfile } = useCurrentWallet()

  return (
    <div className="space-y-2">
      <Entry title="Home" icon={House} href={route('home')} />

      <SearchButton />

      <Entry title="Trade" icon={ArrowRightLeft} href={route('trade')} />

      <Entry title="Discover" icon={Compass} href={route('discover')} />

      {/* <Entry title="Tokens" icon={CircleDollarSign} href={route('tokens')} /> */}

      <Entry
        title="Profile"
        icon={User}
        href={route('entity', { id: mainProfile?.username || '' })}
        disabled={!mainProfile?.username}
      />

      <Entry title="Stake" icon={Beef} href={route('stake')} />

      {process.env.NODE_ENV === 'production' && (
        <DialectNotificationsComponent />
      )}

      {/* <Entry
        title="Design System"
        icon={PaintbrushVertical}
        href={route('designSystem')}
      /> */}
    </div>
  )
}

interface IEntry {
  title: string
  icon: LucideIcon
  href: string
  disabled?: boolean
}

function Entry({ title, icon, href, disabled }: IEntry) {
  const pathname = usePathname()
  const Icon = icon

  return (
    <Button
      disabled={disabled}
      variant={ButtonVariant.GHOST}
      className={cn(
        'flex justify-start w-full gap-4 hover:bg-primary hover:text-background',
        {
          'bg-primary text-background': pathname === href,
        }
      )}
      href={href}
    >
      <Icon size={20} />
      {title}
    </Button>
  )
}

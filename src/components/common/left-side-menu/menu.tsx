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

interface Props {
  setOpen?: (open: boolean) => void
}

export function Menu({ setOpen }: Props) {
  const { mainProfile } = useCurrentWallet()

  return (
    <div className="space-y-4 md:space-y-2">
      <Entry
        title="Home"
        icon={House}
        href={route('home')}
        setOpen={setOpen}
        onlyDesktop
      />

      <SearchButton />

      <Entry
        title="Trade"
        icon={ArrowRightLeft}
        href={route('trade')}
        setOpen={setOpen}
      />

      <Entry
        title="Discover"
        icon={Compass}
        href={route('discover')}
        setOpen={setOpen}
        onlyDesktop
      />

      {/* <Entry title="Tokens" icon={CircleDollarSign} href={route('tokens')} /> */}

      <Entry
        title="Profile"
        icon={User}
        href={route('entity', { id: mainProfile?.username || '' })}
        disabled={!mainProfile?.username}
        setOpen={setOpen}
        onlyDesktop
      />

      <Entry
        title="Stake"
        icon={Beef}
        href={route('stake')}
        setOpen={setOpen}
        onlyDesktop
      />

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
  onlyDesktop?: boolean
  setOpen?: (open: boolean) => void
}

function Entry({ title, icon, href, disabled, onlyDesktop, setOpen }: IEntry) {
  const pathname = usePathname()
  const Icon = icon

  return (
    <Button
      disabled={disabled}
      variant={ButtonVariant.GHOST}
      className={cn(
        'justify-start w-full gap-4 hover:bg-primary hover:text-background text-lg md:text-base h-12 md:h-9',
        {
          'bg-primary text-background': pathname === href,
          'hidden md:flex': onlyDesktop,
        }
      )}
      href={href}
      onClick={() => {
        setOpen && setOpen(false)
      }}
    >
      <Icon size={20} />
      {title}
    </Button>
  )
}

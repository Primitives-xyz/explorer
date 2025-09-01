'use client'

import { DialectNotificationsComponent } from '@/components/notifications/dialect-notifications-component'
import { Button, ButtonVariant } from '@/components/ui/button'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import {
  AlignJustify,
  ArrowRightLeft,
  Beef,
  House,
  LucideIcon,
  PocketKnife,
  TrendingUp,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { UrlObject } from 'url'
import { SearchButton } from '../../search/components/search-button'

interface Props {
  setOpen?: (open: boolean) => void
}

export function Menu({ setOpen }: Props) {
  const { isLoggedIn } = useCurrentWallet()
  const t = useTranslations()

  return (
    <div className="space-y-4 md:space-y-2">
      <Entry
        title={t('menu.trade')}
        icon={ArrowRightLeft}
        href={route('trade')}
        setOpen={setOpen}
        onlyMobile
      />

      <Entry
        title={t('menu.home')}
        icon={House}
        href={route('home')}
        setOpen={setOpen}
      />

      <Entry
        title={t('menu.trenches')}
        icon={PocketKnife}
        href={route('trenches')}
        setOpen={setOpen}
      />

      <Entry
        title="Stonks"
        icon={TrendingUp}
        href={route('stonks')}
        setOpen={setOpen}
      />

      <SearchButton />

      <Entry
        title={t('menu.trade')}
        icon={ArrowRightLeft}
        href={route('trade')}
        setOpen={setOpen}
        onlyDesktop
      />

      <Entry
        title={t('menu.stake')}
        icon={Beef}
        href={route('stake')}
        setOpen={setOpen}
      />

      {isLoggedIn && (
        <Entry
          title={t('menu.leaderboard')}
          icon={AlignJustify}
          href={route('leaderboard')}
          setOpen={setOpen}
        />
      )}

      {process.env.NODE_ENV === 'production' && (
        <DialectNotificationsComponent />
      )}
    </div>
  )
}

interface IEntry {
  title: string
  icon: LucideIcon
  href: string | UrlObject
  disabled?: boolean
  onlyDesktop?: boolean
  onlyMobile?: boolean
  setOpen?: (open: boolean) => void
}

function Entry({
  title,
  icon,
  href,
  disabled,
  onlyDesktop,
  onlyMobile,
  setOpen,
}: IEntry) {
  const pathname = usePathname()
  const Icon = icon

  return (
    <Button
      disabled={disabled}
      variant={ButtonVariant.GHOST}
      className={cn(
        'justify-start w-full gap-4 hover:bg-primary hover:text-background text-lg md:text-sm h-12 md:h-9',
        {
          'bg-primary text-background': pathname === href,
          'hidden md:flex': onlyDesktop,
          'flex md:hidden': onlyMobile,
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

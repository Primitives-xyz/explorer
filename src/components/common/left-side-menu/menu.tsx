'use client'

import { Button, ButtonVariant } from '@/components/ui/button'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'
import {
  ArrowRightLeft,
  House,
  LucideIcon,
  Radio,
  Search,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { UrlObject } from 'url'
import { SearchButton } from '../../search/components/search-button'

interface Props {
  setOpen?: (open: boolean) => void
}

export function Menu({ setOpen }: Props) {
  const t = useTranslations()

  return (
    <div className="space-y-1 md:space-y-1">
      <Entry
        title={t('menu.home')}
        icon={House}
        href={route('home')}
        setOpen={setOpen}
      />

      <Entry
        title={t('menu.trade')}
        icon={ArrowRightLeft}
        href={route('trade')}
        setOpen={setOpen}
      />

      <Entry
        title="Investigate"
        icon={Search}
        href={route('investigate')}
        setOpen={setOpen}
      />

      <Entry
        title="Signals"
        icon={Radio}
        href={route('signals')}
        setOpen={setOpen}
      />

      <div className="pt-2">
        <SearchButton />
      </div>
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
  const isActive = pathname === href || (typeof href === 'string' && pathname.startsWith(href) && href !== '/')

  return (
    <Button
      disabled={disabled}
      variant={ButtonVariant.GHOST}
      className={cn(
        'justify-start w-full gap-3 text-sm h-9 font-mono tracking-wide',
        'hover:bg-primary/10 hover:text-primary transition-colors',
        {
          'bg-primary/15 text-primary shadow-glow-sm': isActive,
          'text-muted-foreground': !isActive,
          'hidden md:flex': onlyDesktop,
          'flex md:hidden': onlyMobile,
        }
      )}
      href={href}
      onClick={() => {
        setOpen && setOpen(false)
      }}
    >
      <Icon size={16} />
      {title}
    </Button>
  )
}

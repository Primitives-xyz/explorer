'use client'

import { LanguageSwitcher } from '@/components/common/language-switcher'
import { Menu } from '@/components/common/left-side-menu/menu'
import {
  Button,
  ButtonVariant,
} from '@/components/ui/button'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ProfileInfos } from './profile-infos'

export function LeftSideMenu() {
  const t = useTranslations()
  const { mainProfile } = useCurrentWallet()

  return (
    <div
      className={cn(
        'hidden md:flex sticky z-20 left-0 top-topbar pt-5 bottom-0 inset-y-0 w-sidebar-left shrink-0 h-screen-minus-topbar'
      )}
    >
      <div className="flex flex-col justify-between h-full overflow-y-auto pb-5 px-5">
        <div className="space-y-5">
          <div>
            <Button href="/" isInvisible>
              <h1 className="font-mono font-bold text-primary text-sm tracking-widest uppercase leading-none">
                Tapestry
              </h1>
            </Button>
            <p className="text-[10px] font-mono text-muted-foreground tracking-wider mt-1">
              Explorer v2.0
            </p>
          </div>
          <ProfileInfos />
          <Menu />
        </div>
        <div className="space-y-2 pt-4">
          <LanguageSwitcher />
          <Button
            variant={ButtonVariant.GHOST}
            href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr"
            newTab
            className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-primary font-mono"
          >
            <MessageCircle size={14} />
            {t('menu.actions.give_feedback')}
          </Button>
        </div>
      </div>
    </div>
  )
}

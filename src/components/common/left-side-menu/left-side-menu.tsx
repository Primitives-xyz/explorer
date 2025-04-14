import { LanguageSwitcher } from '@/components/common/language-switcher'
import { LowFeeTrades } from '@/components/common/left-side-menu/low-fee-trades'
import { Menu } from '@/components/common/left-side-menu/menu'
import { Button, ButtonVariant } from '@/components/ui/button'
import { Lock, MessageCircle } from 'lucide-react'
import { ProfileInfos } from './profile-infos'

export function LeftSideMenu() {
  return (
    <div className="sticky z-20 left-0 top-topbar pt-5 bottom-0 inset-y-0 w-sidebar-left shrink-0 h-screen-minus-topbar">
      <div className="flex flex-col justify-between h-full overflow-y-auto pb-5 px-6">
        <div className="space-y-4">
          <h1 className="font-bold text-primary leading-none">
            solana_social_explorer
          </h1>
          <ProfileInfos />
          <Menu />
        </div>
        <div className="py-10">
          <LowFeeTrades />
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button variant={ButtonVariant.OUTLINE} expand newTab>
            <Lock size={16} />
            Unlock Perpetuals
          </Button>
          <LanguageSwitcher />
          <Button
            variant={ButtonVariant.OUTLINE_WHITE}
            expand
            href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr"
            newTab
          >
            <MessageCircle size={16} />
            Give Feedback
          </Button>
        </div>
      </div>
    </div>
  )
}

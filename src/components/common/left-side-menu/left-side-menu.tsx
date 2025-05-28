'use client'

import { LanguageSwitcher } from '@/components/common/language-switcher'
import { LowFeeTrades } from '@/components/common/left-side-menu/low-fee-trades'
import { Menu } from '@/components/common/left-side-menu/menu'
import { SolidScore } from '@/components/solid-score/components/solid-score'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import AddFundsModal from '@/components/trade/left-content/perpetual/add-funds-modal'
import { Button, ButtonVariant } from '@/components/ui/button'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSpecialUser } from '@/utils/user-permissions'
import { Lock, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ProfileInfos } from './profile-infos'

export function LeftSideMenu() {
  const t = useTranslations()
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
  const { accountIds } = useDriftUsers()
  const { mainProfile } = useCurrentWallet()

  return (
    <div className="hidden md:flex sticky z-20 left-0 top-topbar pt-5 bottom-0 inset-y-0 w-sidebar-left shrink-0 h-screen-minus-topbar">
      <div className="flex flex-col justify-between h-full overflow-y-auto pb-5 px-6">
        <div className="space-y-4">
          <h1 className="font-bold text-primary leading-none">
            {t('menu.title')}
          </h1>
          <ProfileInfos />
          <Menu />
        </div>
        <div className="space-y-4 py-4">
          <LowFeeTrades />
          {isSpecialUser(mainProfile) && <SolidScore />}
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button
            variant={ButtonVariant.OUTLINE}
            className="w-full"
            onClick={() => setIsFundsModalOpen(true)}
          >
            <Lock size={16} />
            {!accountIds.length
              ? t('menu.actions.unlock_perpetuals')
              : t('menu.actions.deposit_withdraw')}
          </Button>
          <LanguageSwitcher />
          <Button
            variant={ButtonVariant.OUTLINE_WHITE}
            href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr"
            newTab
            className="w-full"
          >
            <MessageCircle size={16} />
            {t('menu.actions.give_feedback')}
          </Button>
        </div>
        <AddFundsModal
          isOpen={isFundsModalOpen}
          setIsOpen={setIsFundsModalOpen}
        />
      </div>
    </div>
  )
}

'use client'

import { LanguageSwitcher } from '@/components/common/language-switcher'
import { LowFeeTrades } from '@/components/common/left-side-menu/low-fee-trades'
import { Menu } from '@/components/common/left-side-menu/menu'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import AddFundsModal from '@/components/trade/left-content/perpetual/add-funds-modal'
import { Button, ButtonVariant } from '@/components/ui/button'
import { Lock, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { ProfileInfos } from './profile-infos'

export function LeftSideMenu() {
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
  const { accountIds } = useDriftUsers()

  return (
    <div className="hidden md:flex sticky z-20 left-0 top-topbar pt-5 bottom-0 inset-y-0 w-sidebar-left shrink-0 h-screen-minus-topbar">
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
          <Button
            variant={ButtonVariant.OUTLINE}
            className="w-full"
            onClick={() => setIsFundsModalOpen(true)}
          >
            <Lock size={16} />
            {!accountIds.length ? 'Unlock Perpetuals' : 'Deposit/Withdraw'}
          </Button>
          <LanguageSwitcher />
          <Button
            variant={ButtonVariant.OUTLINE_WHITE}
            href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr"
            newTab
          >
            <MessageCircle size={16} />
            Give Feedback
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

'use client'

import { LanguageSwitcher } from '@/components/common/language-switcher'
import { LowFeeTrades } from '@/components/common/left-side-menu/low-fee-trades'
import { Menu } from '@/components/common/left-side-menu/menu'
import { MigrationReminder } from '@/components/common/left-side-menu/migration-reminder'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import AddFundsModal from '@/components/trade/left-content/perpetual/add-funds-modal'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  CopyToClipboardButton,
} from '@/components/ui/button'
import { SSE_CONTRACT_ADDRESS } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { CopyIcon, Lock, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ProfileInfos } from './profile-infos'

export function LeftSideMenu() {
  const t = useTranslations()
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
  const { accountIds } = useDriftUsers()
  const { mainProfile } = useCurrentWallet()

  return (
    <div
      className={cn(
        'hidden md:flex sticky z-20 left-0 top-topbar pt-5 bottom-0 inset-y-0 w-sidebar-left shrink-0 h-screen-minus-topbar',
        {
          'backdrop-blur-md': !!mainProfile?.pudgy_profile_date,
        }
      )}
    >
      <div className="flex flex-col justify-between h-full overflow-y-auto pb-5 px-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Button href="/" isInvisible>
              <h1 className="font-bold text-primary leading-none">
                {t('menu.title')}
              </h1>
            </Button>

            <CopyToClipboardButton
              textToCopy={SSE_CONTRACT_ADDRESS}
              className="w-full mt-2"
              size={ButtonSize.SM}
              variant={ButtonVariant.BADGE_WHITE}
            >
              <p className="truncate">{SSE_CONTRACT_ADDRESS}</p>
              <CopyIcon />
            </CopyToClipboardButton>
          </div>
          <ProfileInfos />
          <Menu />
          {/* <ResetProfileButton /> */}
          {/* <TestThemeButton /> */}
        </div>
        <div className="space-y-4 py-4">
          <MigrationReminder />
          <LowFeeTrades />
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

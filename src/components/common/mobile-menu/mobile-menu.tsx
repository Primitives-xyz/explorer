'use client'

import { LanguageSwitcher } from '@/components/common/language-switcher'
import { Menu } from '@/components/common/left-side-menu/menu'
import { ProfileInfos } from '@/components/common/left-side-menu/profile-infos'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import AddFundsModal from '@/components/trade/left-content/perpetual/add-funds-modal'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Lock, LogOutIcon, MessageCircle, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  setOpen: (open: boolean) => void
}

export function MobileMenu({ setOpen }: Props) {
  const { logout } = useCurrentWallet()

  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
  const { accountIds } = useDriftUsers()

  return (
    <div className="flex flex-col items-start md:hidden z-100 h-screen w-full bg-background fixed top-0 left-0">
      <div className="flex justify-between items-center gap-2">
        <Button
          variant={ButtonVariant.GHOST}
          size={ButtonSize.ICON}
          onClick={() => setOpen(false)}
        >
          <X className="text-primary" />
        </Button>
        <h1 className="font-bold text-primary leading-none">
          solana_social_explorer
        </h1>
      </div>
      <div className="px-4 py-2 space-y-6 w-full">
        <ProfileInfos />
        <Menu setOpen={setOpen} />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr"
              newTab
              className="w-[48%]"
            >
              <MessageCircle size={16} />
              Give Feedback
            </Button>
            <Button
              variant={ButtonVariant.OUTLINE}
              className="w-[48%]"
              onClick={() => setIsFundsModalOpen(true)}
            >
              <Lock size={16} />
              {!accountIds.length ? 'Unlock Perpetuals' : 'Deposit/Withdraw'}
            </Button>
          </div>
          <div>
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={logout}
              className="w-full"
            >
              <LogOutIcon size={18} />
              Logout
            </Button>
          </div>

          <div className="flex items-center w-full justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <AddFundsModal
        isOpen={isFundsModalOpen}
        setIsOpen={setIsFundsModalOpen}
      />
    </div>
  )
}

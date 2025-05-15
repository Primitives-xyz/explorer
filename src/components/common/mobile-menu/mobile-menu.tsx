'use client'

import { Menu } from '@/components/common/left-side-menu/menu'
import { ProfileInfos } from '@/components/common/left-side-menu/profile-infos'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import AddFundsModal from '@/components/trade/left-content/perpetual/add-funds-modal'
import {
  Button,
  ButtonVariant,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
} from '@/components/ui'
import { Separator } from '@/components/ui/separator'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Lock, LogOutIcon, MessageCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export function MobileMenu({ open, setOpen }: Props) {
  const { logout, isLoggedIn } = useCurrentWallet()
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
  const { accountIds } = useDriftUsers()
  const t = useTranslations()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="flex flex-col gap-0" hideCloseButton>
        <DialogHeader className="hidden">
          <DialogTitle>{t('menu.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-5 h-14 px-3">
          <Button isInvisible onClick={() => setOpen(false)}>
            <X className="text-primary" />
          </Button>
          <h1 className="font-medium text-primary leading-none text-lg">
            {t('menu.title')}
          </h1>
        </div>
        <div className="px-6 pb-6 w-full flex flex-col flex-1">
          <ProfileInfos setOpen={setOpen} />
          <Separator className="mt-4" />
          <div className="flex-1">
            <Menu setOpen={setOpen} />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <Separator className="my-0 mb-2" />
            <div className="flex items-center gap-4 w-full">
              <Button
                variant={ButtonVariant.OUTLINE_WHITE}
                href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr"
                className="flex-1"
                newTab
              >
                <MessageCircle size={16} />
                {t('menu.actions.feedback')}
              </Button>
              <Button
                variant={ButtonVariant.OUTLINE}
                onClick={() => setIsFundsModalOpen(true)}
                className="flex-1"
              >
                <Lock size={16} />
                {!accountIds.length
                  ? t('menu.actions.perpetuals')
                  : t('menu.actions.deposit_withdraw')}
              </Button>
            </div>
            {!!isLoggedIn && (
              <Button
                variant={ButtonVariant.OUTLINE}
                onClick={logout}
                className="w-full"
              >
                <LogOutIcon size={18} />
                {t('menu.profile.logout')}
              </Button>
            )}
            {/* <div className="flex items-center w-full justify-center">
              <LanguageSwitcher />
            </div> */}
          </div>
        </div>
        <AddFundsModal
          isOpen={isFundsModalOpen}
          setIsOpen={setIsFundsModalOpen}
        />
      </SheetContent>
    </Sheet>
  )
}

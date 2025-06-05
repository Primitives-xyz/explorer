'use client'

import { Menu } from '@/components/common/left-side-menu/menu'
import { MigrationReminder } from '@/components/common/left-side-menu/migration-reminder'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import { Button, ButtonVariant } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
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
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 z-50 w-72 h-full bg-background transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-3 h-14">
          <Button href={route('home')} isInvisible>
            <Image src="/images/logo.svg" alt="logo" width={34} height={34} />
          </Button>
          <Button onClick={() => setOpen(false)} isInvisible>
            <X className="text-primary" />
          </Button>
        </div>

        <div className="p-3">
          <Button
            href={route('trade')}
            variant={ButtonVariant.DEFAULT}
            className="w-full mb-4 text-lg"
          >
            Trade
          </Button>
          <Menu setOpen={setOpen} />
          <div className="mt-4">
            <MigrationReminder />
          </div>
        </div>
      </div>
    </>
  )
}

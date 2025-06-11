'use client'

import { Menu } from '@/components/common/left-side-menu/menu'
import { MigrationReminder } from '@/components/common/left-side-menu/migration-reminder'
import { Button } from '@/components/ui'
import { route } from '@/utils/route'
import { X } from 'lucide-react'
import Image from 'next/image'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export function MobileMenu({ open, setOpen }: Props) {
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
            <Image
              src="/images/logo-mobile.svg"
              alt="logo"
              width={34}
              height={34}
            />
          </Button>
          <Button onClick={() => setOpen(false)} isInvisible>
            <X className="text-primary" />
          </Button>
        </div>

        <div className="p-3">
          <Menu setOpen={setOpen} />
          <div className="mt-4">
            <MigrationReminder />
          </div>
        </div>
      </div>
    </>
  )
}

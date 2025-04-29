'use client'

import { MobileMenu } from '@/components/common/mobile-menu/mobile-menu'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { Menu as MenuIcon } from 'lucide-react'
import { useState } from 'react'

export function MobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button
        variant={ButtonVariant.GHOST}
        size={ButtonSize.ICON}
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="text-primary" />
      </Button>
      {open && <MobileMenu setOpen={setOpen} />}
    </div>
  )
}

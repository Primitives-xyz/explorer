'use client'

import { MobileMenu } from '@/components/common/mobile-menu/mobile-menu'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Menu as MenuIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const { setShowAuthFlow, mainProfile } = useCurrentWallet()

  return (
    <>
      <div className="flex md:hidden items-center justify-between py-2 px-3 h-14">
        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(true)} isInvisible>
            <MenuIcon className="text-primary" />
          </Button>
          <Button href={route('home')} isInvisible>
            <Image
              src="/images/logo-mobile.svg"
              alt="logo"
              width={34}
              height={34}
            />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {/* <SearchButton /> */}
          {!!mainProfile ? (
            <>
              {/* <Button
                href={route('entity', { id: mainProfile.username })}
                isInvisible
              >
                <Avatar
                  username={mainProfile.username}
                  imageUrl={mainProfile.image}
                  className="w-10"
                  size={40}
                />
              </Button> */}
              <Avatar
                username={mainProfile.username}
                imageUrl={mainProfile.image}
                className="w-10"
                size={40}
              />
            </>
          ) : (
            <Button
              // size={ButtonSize.SM}
              // variant={ButtonVariant.OUTLINE_WHITE}
              onClick={() => setShowAuthFlow(true)}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
      <MobileMenu open={open} setOpen={setOpen} />
    </>
  )
}

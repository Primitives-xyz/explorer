import { LanguageSwitcher } from '@/components-new-version/common/language-switcher'
import { Menu } from '@/components-new-version/common/left-side-menu/menu'
import { Button, ButtonVariant } from '@/components-new-version/ui/button'
import { MessageCircle } from 'lucide-react'
import Image from 'next/image'

export function LeftSideMenu() {
  return (
    <div className="pt-[100px] h-full flex flex-col justify-between pb-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Image
            src="/images/sonala-social-explorer-icon.svg"
            width={30}
            height={30}
            alt="icon"
          />
          <h1 className="text-md font-mono font-bold tracking-tight text-primary">
            solana_social_explorer
          </h1>
        </div>

        <Menu />
      </div>
      <div className="w-full flex flex-col items-center gap-6">
        <LanguageSwitcher />
        <Button
          variant={ButtonVariant.OUTLINE_WHITE}
          expand
          href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr"
          newTab
        >
          <MessageCircle />
          Give Feedback
        </Button>
      </div>
    </div>
  )
}

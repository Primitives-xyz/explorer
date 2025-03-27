import { LanguageSwitcher } from '@/components-new-version/common/language-switcher'
import { Menu } from '@/components-new-version/common/left-side-menu/menu'
import { Button, ButtonVariant } from '@/components-new-version/ui/button'
import { MessageCircle } from 'lucide-react'

export function LeftSideMenu() {
  return (
    <div className="pt-[100px] h-screen flex flex-col justify-between pb-6">
      <div className="space-y-6">
        <h1 className="text-lg font-bold text-primary">
          solana_social_explorer
        </h1>

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

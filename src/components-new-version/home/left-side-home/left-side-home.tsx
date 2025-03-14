import { LanguageSwitcher } from '@/components-new-version/common/language-switcher'
import { Menu } from '@/components-new-version/home/left-side-home/menu'
import { Button } from '@/components-new-version/ui/button'
import { MessageCircle } from 'lucide-react'
import Image from 'next/image'

export function LeftSideHome() {
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
          <h1 className="text-md font-mono font-bold tracking-tight text-accent">
            solana_social_explorer
          </h1>
        </div>

        <Menu />
      </div>
      <div className="w-full flex flex-col items-center gap-6">
        <LanguageSwitcher />
        <Button variant="outline" expand>
          <MessageCircle />
          Give Feedback
        </Button>
      </div>
    </div>
  )
}

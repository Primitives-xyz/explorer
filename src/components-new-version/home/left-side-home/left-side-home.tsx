import { LanguageSwitcher } from '@/components-new-version/common/language-switcher'

export function LeftSideHome() {
  return (
    <div className="pt-[100px] h-full flex flex-col items-center justify-between pb-6">
      <h1 className="text-xl font-mono font-bold tracking-tight text-accent">
        {`>`} solana_social_explorer
      </h1>
      <LanguageSwitcher />
    </div>
  )
}

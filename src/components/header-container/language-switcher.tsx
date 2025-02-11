'use client'

import { locales } from '@/i18n'
import { usePathname, useRouter } from 'next/navigation'

const languageLabels: Record<string, string> = {
  en: '🇬🇧 English',
  fr: '🇫🇷 Français',
  zh: '🇨🇳 中文',
}

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1]

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value
    const newPath = `/${newLocale}${pathname.substring(3)}`
    router.push(newPath)
  }

  return (
    <select
      value={currentLocale}
      onChange={changeLanguage}
      className="px-3 h-[34px] border border-green-500/50 bg-black text-green-400 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer uppercase"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {languageLabels[locale] || locale.toUpperCase()}
        </option>
      ))}
    </select>
  )
}

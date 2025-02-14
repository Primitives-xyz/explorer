'use client'

import { locales } from '@/i18n'
import { useLocale } from 'next-intl'

const languageLabels: Record<string, string> = {
  en: '🇬🇧 English',
  zh: '🇨🇳 中文',
}

export function LanguageSwitcher() {
  const locale = useLocale()

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <select
      value={locale}
      onChange={changeLanguage}
      className="px-3 h-[34px] border border-green-500/50 bg-black  hover:border-green-400 font-mono text-sm transition-colors cursor-pointer uppercase"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {languageLabels[locale] || locale.toUpperCase()}
        </option>
      ))}
    </select>
  )
}

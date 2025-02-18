'use client'

import { locales } from '@/i18n'

export function LanguageSwitcher() {
  const currentLocale =
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] || locales[0]

  const changeLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => changeLanguage(locale)}
          className={`px-2 ${
            currentLocale === locale ? 'text-white' : 'opacity-50'
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  )
}

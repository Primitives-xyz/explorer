'use client'

import { Button } from '@/components-new-version/ui'
import { locales } from '@/i18n'
import { useEffect, useState } from 'react'

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<string>(locales[0])

  useEffect(() => {
    const savedLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]

    if (savedLocale) {
      setCurrentLocale(savedLocale)
    }
  }, [])

  const changeLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    setCurrentLocale(newLocale)
    window.location.reload()
  }

  return (
    <div className="flex items-center">
      <p className="font-light">languages: </p>
      {locales.map((locale) => (
        <Button
          variant="ghost"
          key={locale}
          onClick={() => changeLanguage(locale)}
          className={`px-2 ${
            currentLocale === locale ? 'text-white' : 'opacity-50'
          }`}
        >
          {locale}
        </Button>
      ))}
    </div>
  )
}

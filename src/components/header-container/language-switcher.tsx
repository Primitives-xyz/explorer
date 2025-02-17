'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/popover/dropdown-menu'
import { locales } from '@/i18n'
import { EllipsisVertical } from 'lucide-react'
import { useState } from 'react'

const languageLabels: Record<string, string> = {
  en: '🇺🇸 English',
  zh: '🇨🇳 中文',
}

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)

  const changeLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="p-2 rounded-md hover:bg-gray-700 transition">
        <EllipsisVertical className="w-5 h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => changeLanguage(locale)}
            className="cursor-pointer"
          >
            {languageLabels[locale] || locale.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

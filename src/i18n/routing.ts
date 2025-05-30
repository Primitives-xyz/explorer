import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const locales = ['en'] as const

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'never',
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing) 
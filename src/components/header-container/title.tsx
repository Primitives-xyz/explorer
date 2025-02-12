import { route } from '@/utils/routes'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function Title() {
  const t = useTranslations()

  return (
    <Link href={route('home')} className="hover:opacity-80 transition-opacity">
      <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-green-400 truncate">
        {`>`} {t('header.title')}
      </h1>
    </Link>
  )
}

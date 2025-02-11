import { route } from '@/utils/routes'
import Link from 'next/link'

export function Title() {
  return (
    <Link href={route('home')} className="hover:opacity-80 transition-opacity">
      <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-green-400 truncate">
        {`>`} solana_social_explorer
      </h1>
    </Link>
  )
}

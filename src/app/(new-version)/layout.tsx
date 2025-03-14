import { ActivityTape } from '@/components/components-new-version/activity-tape/activity-tape'
import { cn } from '@/components/components-new-version/utils/utils'
import { Rethink_Sans } from 'next/font/google'
import { ReactNode } from 'react'
import './new-version.css'

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default async function NewVersionLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div
      className={cn('w-full background-image-gradient', rethinkSans.className)}
    >
      <Header />
      <div className="w-full mx-auto container">{children}</div>
    </div>
  )
}

function Header() {
  return (
    <div className="absolute top-0 left-0 w-full">
      <ActivityTape />
    </div>
  )
}

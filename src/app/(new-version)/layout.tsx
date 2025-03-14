import { Header } from '@/components-new-version/common/header'
import { cn } from '@/utils'
import { Rethink_Sans } from 'next/font/google'
import { ReactNode } from 'react'
import './global.css'

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
      className={cn(
        'w-full min-h-screen background-image-gradient',
        rethinkSans.className
      )}
    >
      <Header />
      <div className="w-full mx-auto container">{children}</div>
    </div>
  )
}

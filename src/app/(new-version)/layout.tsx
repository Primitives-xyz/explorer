import { Header } from '@/components-new-version/common/header'
import { LeftSideMenu } from '@/components-new-version/common/left-side-menu/left-side-menu'
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
        'w-full min-h-screen background-gradient',
        rethinkSans.className
      )}
    >
      <Header />
      <div className="w-full mx-auto container">
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-8">
          <LeftSideMenu />
          {children}
        </div>
      </div>
    </div>
  )
}

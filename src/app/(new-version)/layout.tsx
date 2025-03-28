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
  isSimplePage,
}: {
  children: ReactNode
  isSimplePage?: boolean
}) {
  return (
    <div
      className={cn(
        'w-full min-h-screen background-gradient',
        rethinkSans.className
      )}
    >
      <Header />
      <div className="w-full px-10">
        <div className="flex w-full justify-between">
          <LeftSideMenu />
          {children}
        </div>
      </div>
    </div>
  )
}

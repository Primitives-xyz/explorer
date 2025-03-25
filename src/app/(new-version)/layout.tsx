import { Rethink_Sans } from 'next/font/google'
import { ReactNode } from 'react'
import { LeftSideMenu } from '@/components-new-version/common/left-side-bar'
import { ActivityTape } from '@/components-new-version/activity-tape'
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
    <div className='background-gradient'>
      {/* <Toaster /> */}
      <ActivityTape />
      <div>
        <div className="flex flex-row">
          <LeftSideMenu />
          <div className='w-full h-[calc(100vh-50px)] overflow-y-auto p-8'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

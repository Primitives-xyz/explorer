import { ActivityTape } from '@/components/components-new-version/activity-tape/activity-tape'
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
      className={`w-full h-screen background-image-gradient ${rethinkSans.className}`}
    >
      <ActivityTape />
      <div className="w-full mx-auto container mt-14">{children}</div>
    </div>
  )
}

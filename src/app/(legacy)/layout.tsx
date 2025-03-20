import { ActivityTape } from '@/components/activity-tape'
import { GlobalSearch } from '@/components/global-search'
import { CreateProfile } from '@/components/profile/create-profile'
import { Toaster } from '@/components/toast/toaster'
import './legacy.css'
import '../(new-version)/global.css'
import { LeftSideMenu } from '@/components/common/left-side-bar'

export default async function LegacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='background-gradient'>
      {/* <Toaster /> */}
      <ActivityTape />
      <div>
        <div className="flex flex-row">
          <LeftSideMenu />
          <div className='w-full h-[calc(100vh-50px)] overflow-y-auto border border-white/20 border-l-0 p-8'>
            {children}
          </div>
        </div>
      </div>
      <CreateProfile />
      <GlobalSearch />
    </div>
  )
}

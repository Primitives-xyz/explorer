import { ActivityTape } from '@/components/activity-tape'
import { FeedbackButton } from '@/components/common/feedback-button'
import { Footer } from '@/components/common/footer'
import { GlobalSearch } from '@/components/global-search'
import { Header } from '@/components/header-container/header'
import { CreateProfile } from '@/components/profile/create-profile'
import { Toaster } from '@/components/toast/toaster'
import './legacy.css'

export default async function LegacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster />
      <ActivityTape />
      <div className="xl:p-2 w-full overflow-hidden bg-[#292C31] text-[#F5F8FD] font-mono min-h-dvh flex flex-col">
        <Header />
        {children}
        <Footer />
        <CreateProfile />
        <FeedbackButton />
      </div>
      <GlobalSearch />
    </>
  )
}

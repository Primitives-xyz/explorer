import { HomeContent } from '@/components-new-version/home/home-content/home-content'
import { LeftSideHome } from '@/components-new-version/home/left-side-home/left-side-home'
import { RightSideHome } from '@/components-new-version/home/right-side-home/right-side-home'

export default function Home() {
  return (
    <div className="grid grid-cols-[1fr_3fr_1fr] gap-8">
      <LeftSideHome />
      <HomeContent />
      <RightSideHome />
    </div>
  )
}

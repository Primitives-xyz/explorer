import { ActivityTape } from '@/components-new-version/activity-tape/activity-tape'

export function Header() {
  return (
    <div className="fixed top-0 left-0 inset-x-0 py-2 z-20 backdrop-blur-md">
      <ActivityTape />
    </div>
  )
}

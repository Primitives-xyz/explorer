import { ActivityTape } from '@/components-new-version/activity-tape/activity-tape'

export function Header() {
  return (
    <div className="absolute top-0 left-0 w-full z-10 backdrop-blur-md py-2">
      <ActivityTape />
    </div>
  )
}

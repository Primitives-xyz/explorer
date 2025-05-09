import { formatTimeAgo } from '@/utils/utils'

export function TokenCreatedTime({ createdAt }: { createdAt?: number | null }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-[10px] text-white">{createdAt ? formatTimeAgo(new Date(createdAt * 1000)) : '--'}</span>
    </div>
  )
} 
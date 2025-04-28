import { cn } from '@/utils/utils'

export function LoadingCard() {
  return (
    <div
      className={cn(
        'rounded-card overflow-hidden',
        'w-full h-full absolute inset-0 top-0 left-0 p-1',
        'card-motion'
      )}
    >
      <div className="absolute-centered w-[120%] aspect-square z-10">
        <div className="card-radial-border absolute inset-0 top-0 left-0" />
      </div>
      <div
        className={cn(
          'transition-all duration-300 relative z-20 w-full h-full',
          // 'bg-[#4a4a48] rounded-[calc(var(--radius-card)-2px)]'
          'bg-[#312a2b] rounded-[calc(var(--radius-card)-2px)]',
          'opacity-80'
        )}
      />
    </div>
  )
}

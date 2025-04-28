import { useElementSize } from '@/utils/use-element-size'
import { cn } from '@/utils/utils'

export function LoadingCard() {
  const { setRef, size } = useElementSize()

  const { width, height } = size
  const biggerSide = Math.max(width, height)

  return (
    <div
      className={cn(
        'rounded-card overflow-hidden',
        'w-full h-full absolute inset-0 top-0 left-0 p-1',
        'border-glow-animation'
      )}
      ref={setRef}
    >
      <div
        className="absolute-centered z-10 rounded-full overflow-hidden"
        style={{
          width: `${biggerSide + 200}px`,
          height: `${biggerSide + 200}px`,
        }}
      >
        <div className="card-radial-border absolute inset-0 top-0 left-0" />
      </div>
      <div
        className={cn(
          'transition-all duration-300 relative z-20 w-full h-full',
          'bg-[#312a2b] rounded-[calc(var(--radius-card)-2px)]',
          'opacity-90'
        )}
      />
    </div>
  )
}

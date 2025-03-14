import { LoaderCircle } from 'lucide-react'
import { cn } from '../utils/utils'

export function Spinner({
  size = 24,
  large = false,
  className,
}: {
  size?: number
  large?: boolean
  className?: string
}) {
  return (
    <LoaderCircle
      size={large ? 32 : size}
      className={cn('animate-spin', className)}
    />
  )
}

export function FullPageSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn('min-h-screen flex items-center justify-center', className)}
    >
      <Spinner large />
    </div>
  )
}

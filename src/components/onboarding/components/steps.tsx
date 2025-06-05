import { cn } from '@/utils/utils'
import { Fragment } from 'react'

interface Props {
  step: number
  total: number
}

export function Steps({ step, total }: Props) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <Fragment key={index}>
          <div className="flex items-center">
            <Step index={index + 1} isActive={step > index} />
          </div>
          {index < total - 1 && <div className="bg-border h-px w-6" />}
        </Fragment>
      ))}
    </div>
  )
}

function Step({ index, isActive }: { index: number; isActive: boolean }) {
  return (
    <div
      className={cn(
        'w-6 aspect-square rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs',
        {
          'bg-primary text-primary-foreground': isActive,
        }
      )}
    >
      {index}
    </div>
  )
}

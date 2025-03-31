import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function OverflowContentWrapper({ children }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center max-w-main-content mx-auto">
      {children}
    </div>
  )
}

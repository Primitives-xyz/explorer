'use client'

import { Button } from '@/components-new-version/ui'
import { ReactNode } from 'react'

interface Props {
  href: string
  image: ReactNode
  title: ReactNode
  subtitle: ReactNode
  rightContent?: ReactNode
  closePopover: () => void
}

export function SearchResultsEntry({
  href,
  image,
  title,
  subtitle,
  rightContent,
  closePopover,
}: Props) {
  return (
    <Button
      className="flex items-center gap-3 transition hover:bg-accent px-3 py-2 w-full"
      href={href}
      isInvisible
      onClick={closePopover}
    >
      <div>{image}</div>
      <div className="flex justify-between w-full">
        <div className="flex flex-col items-start">
          <h4 className="text-sm font-semibold max-w-[12rem] truncate">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {rightContent && (
          <div className="text-sm text-medium">{rightContent}</div>
        )}
      </div>
    </Button>
  )
}

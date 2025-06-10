'use client'

import { Button, ButtonSize, Card, CardContent, Spinner } from '@/components/ui'
import { cn } from '@/utils/utils'
import { usePathname } from 'next/navigation'

interface Props {
  simpleRevealButton?: boolean
}

interface Props {
  title: string
  description: string
  buttonText: string
  buttonHref?: string
  loading?: boolean
  isOnProfilePage: boolean
  buttonAction: () => void
}

export function SolidScoreCard({
  title,
  description,
  buttonText,
  buttonHref,
  loading,
  isOnProfilePage,
  buttonAction,
}: Props) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'flex gap-4 w-full',
        pathname === '/' && 'py-4',
        isOnProfilePage && 'py-4 md:py-0'
      )}
    >
      <Card className="flex-1">
        <CardContent
          className={cn(
            pathname === '/' ? 'p-2 md:py-6' : 'p-2 max-w-40 w-full'
          )}
        >
          <div className="flex flex-col gap-2 text-xs text-center">
            <p className="font-bold">{title}</p>
            <p>{description}</p>
          </div>
        </CardContent>
      </Card>

      <Button
        className={cn(
          pathname === '/'
            ? 'p-2 md:py-6 w-1/2 md:max-w-full'
            : 'p-2 max-w-40 w-full md:w-auto',
          'h-auto'
        )}
        size={ButtonSize.LG}
        onClick={buttonAction}
        href={buttonHref}
      >
        {loading ? <Spinner size={16} /> : buttonText}
      </Button>
    </div>
  )
}

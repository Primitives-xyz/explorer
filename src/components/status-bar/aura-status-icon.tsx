import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/popover/tooltip'
import Image from 'next/image'

interface Props {
  points: string
}

export function AuraStatusIcon({ points }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="cursor-pointer">
          <div className="flex items-center">
            <Image
              src="/images/status-bar/status-bar-form.svg"
              alt="Aura Status"
              width={18}
              height={18}
              className="mr-2"
            />
            <span className="font-bold mr-2 text-primary">{points}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-bold text-sm">Aura Points</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

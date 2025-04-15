import { CheckIcon, CopyIcon } from 'lucide-react'
import useClipboard from 'react-use-clipboard'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../popover/tooltip'
import { Button, ButtonProps } from './button'

interface Props extends ButtonProps {
  textToCopy: string
  iconSize?: number
}

export function CopyToClipboardButton({
  textToCopy,
  iconSize,
  children,
  ...props
}: Props) {
  const [isCopied, setCopied] = useClipboard(textToCopy, {
    successDuration: 2000,
  })

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button {...props} onClick={setCopied}>
            {!!children ? (
              children
            ) : (
              <>
                {isCopied ? (
                  <CheckIcon size={iconSize} />
                ) : (
                  <CopyIcon size={iconSize} />
                )}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

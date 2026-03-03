import { Button } from '../ui'
import { TapestryLogo } from './tapestry-logo'

export function PoweredbyTapestry() {
  return (
    <Button
      className="flex items-end gap-1.5 text-muted-foreground"
      href="https://sse.gg/"
      isInvisible
      newTab
    >
      <span className="text-[10px] leading-none">powered by SSE</span>
      <TapestryLogo
        iconColor="hsl(225deg 3% 75%)"
        className="w-[48px] h-[20px] relative top-[3px]"
      />
    </Button>
  )
}

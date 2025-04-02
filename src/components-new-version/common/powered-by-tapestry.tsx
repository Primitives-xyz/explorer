import { TapestryLogo } from './tapestry-logo'

export function PoweredbyTapestry() {
  return (
    <div className="flex items-end gap-1.5 text-muted-foreground">
      <span className="text-[10px] leading-none">powered by</span>
      <TapestryLogo
        iconColor="hsl(225deg 3% 75%)"
        className="w-[48px] h-[20px] relative top-[3px]"
      />
    </div>
  )
}

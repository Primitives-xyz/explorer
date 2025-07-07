import { DesktopCondensed } from '@/components/status-bar/condensed/desktop-condensed'
import { MobileCondensed } from '@/components/status-bar/condensed/mobile-condensed'
import { StatusBarData } from '@/components/status-bar/status-bar'
import { useIsMobile } from '@/utils/use-is-mobile'

interface Props {
  data: StatusBarData
}

export function CondensedStatusBar({ data }: Props) {
  const { isMobile } = useIsMobile()

  if (isMobile) {
    return <MobileCondensed data={data} />
  } else {
    return <DesktopCondensed data={data} />
  }
}

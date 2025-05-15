import { Button, ButtonSize, Spinner } from '@/components/ui'
import { cn } from '@/utils/utils'
import { Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  onClick: () => void
  loading: boolean
  smallView?: boolean
}

export function SolidScoreRevealButton({ onClick, loading, smallView }: Props) {
  const t = useTranslations('menu.solid_score')

  return (
    <Button
      className={cn({ 'w-full': !smallView })}
      onClick={onClick}
      disabled={loading}
      size={smallView ? ButtonSize.SM : ButtonSize.DEFAULT}
    >
      {loading ? <Spinner size={16} /> : <Eye size={16} />}
      {t('reveal_button')}
    </Button>
  )
}

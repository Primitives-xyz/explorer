import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button, ButtonSize, Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  smallView?: boolean
  onRevealComplete?: () => void
}

export function SolidScoreRevealButton({ smallView, onRevealComplete }: Props) {
  const t = useTranslations('menu.solid_score')
  const { mainProfile, refetch } = useCurrentWallet()
  const { updateProfile, loading } = useUpdateProfile({
    username: mainProfile?.username || '',
  })

  const handleRevealClick = async () => {
    await updateProfile({
      properties: [
        {
          key: 'userRevealedTheSolidScore',
          value: true,
        },
      ],
    })
    await refetch()
    onRevealComplete?.()
  }

  return (
    <Button
      className={cn({ 'w-full': !smallView })}
      onClick={handleRevealClick}
      disabled={loading}
      size={smallView ? ButtonSize.SM : ButtonSize.DEFAULT}
    >
      {loading ? <Spinner size={16} /> : <Eye size={16} />}
      {t('reveal_button')}
    </Button>
  )
}

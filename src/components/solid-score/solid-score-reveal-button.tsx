import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button, Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  onRevealComplete?: () => void
}

export function SolidScoreRevealButton({ onRevealComplete }: Props) {
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
    <Button className="w-full" onClick={handleRevealClick} disabled={loading}>
      {loading ? <Spinner size={16} /> : <Eye size={16} />}
      {t('reveal_button')}
    </Button>
  )
}

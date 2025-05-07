import { Button, Spinner } from '@/components/ui'
import { Eye } from 'lucide-react'

export function SolidScoreRevealButton({
  onClick,
  loading,
}: {
  onClick: () => void
  loading: boolean
}) {
  return (
    <Button className="w-full" onClick={onClick} disabled={loading}>
      {loading ? (
        <Spinner className="mr-2 h-4 w-4" />
      ) : (
        <Eye size={16} className="mr-2" />
      )}
      Reveal
    </Button>
  )
}

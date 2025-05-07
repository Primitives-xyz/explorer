import { Button, ButtonVariant, Spinner } from '@/components/ui'

interface ConfirmProps {
  accountIds: number[]
  amount: string
  loading: boolean
  isChecked: boolean
  handleConfirm: () => void
}

export default function Confirm({
  accountIds,
  amount,
  loading,
  isChecked,
  handleConfirm,
}: ConfirmProps) {
  return (
    <>
      {!accountIds.length ? (
        <Button
          variant={
            isChecked && Number(amount) > 0
              ? ButtonVariant.DEFAULT
              : ButtonVariant.OUTLINE_WHITE
          }
          className="w-full"
          onClick={handleConfirm}
          disabled={!isChecked || loading || Number(amount) === 0}
        >
          {loading ? <Spinner /> : 'Confirm'}
        </Button>
      ) : (
        <Button
          variant={
            Number(amount) > 0
              ? ButtonVariant.DEFAULT
              : ButtonVariant.OUTLINE_WHITE
          }
          className="w-full"
          onClick={handleConfirm}
          disabled={Number(amount) === 0 || loading}
        >
          {loading ? <Spinner /> : 'Confirm'}
        </Button>
      )}
    </>
  )
}

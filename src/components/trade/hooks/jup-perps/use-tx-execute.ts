import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useToastContent } from '../drift/use-toast-content'

interface TxExecuteParams {
  action: string
  serializedTxBase64: string | null
}

const useTxExecute = ({ serializedTxBase64, action }: TxExecuteParams) => {
  const { LOADINGS } = useToastContent()
  const [loading, setLoading] = useState<boolean>(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [isTxSuccess, setIsTxSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (!serializedTxBase64) {
      return
    }

    const fetchTxId = async () => {
      try {
        setLoading(true)
        setTxId(null)

        const confirmToastId = toast(
          LOADINGS.CONFIRM_LOADING.title,
          LOADINGS.CONFIRM_LOADING.content
        )

        const response = await fetch('/api/jupiter/transaction', {
          method: 'POST',
          body: JSON.stringify({ serializedTxBase64, action }),
        })

        toast.dismiss(confirmToastId)

        if (!response.ok) {
          toast.error('Failed to execute transaction', {
            description: 'Please try again',
            duration: 5000,
          })
          return
        }

        const data = await response.json()
        setTxId(data.txid)
        setIsTxSuccess(true)
        toast.success('Transaction executed successfully', {
          description: data.txid,
          duration: 5000,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        toast.dismiss()
        toast.error('Failed to execute transaction', {
          description: errorMessage,
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTxId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedTxBase64, action])

  return {
    loading,
    txId,
    isTxSuccess,
  }
}

export default useTxExecute

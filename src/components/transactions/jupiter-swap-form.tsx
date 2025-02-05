import { useState, useEffect } from 'react'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { VersionedTransaction } from '@solana/web3.js'
import { isSolanaWallet } from '@dynamic-labs/solana'
import type { PriorityLevel } from '@/app/api/priority-fee/route'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface JupiterSwapFormProps {
  initialInputMint?: string
  initialOutputMint?: string
  initialAmount?: string
  inputTokenName?: string
  outputTokenName?: string
  inputDecimals?: number
}

// Platform fee configuration
const PLATFORM_FEE_BPS = 100 // 1% = 100 basis points
const PLATFORM_FEE_ACCOUNT = 'NAMEPoWfnM4c1F9EoXcUgsQPwXZiy6pYpnTPM71aDwj'

const PRIORITY_LEVELS: { label: string; value: PriorityLevel }[] = [
  { label: 'Minimum', value: 'Min' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Very High', value: 'VeryHigh' },
  { label: 'Maximum (Unsafe)', value: 'UnsafeMax' },
]

export const JupiterSwapForm = ({
  initialInputMint = 'So11111111111111111111111111111111111111112',
  initialOutputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  initialAmount = '',
  inputTokenName = 'SOL',
  outputTokenName = 'USDC',
  inputDecimals = 9,
}: JupiterSwapFormProps) => {
  const { toast } = useToast()
  const [inputAmount, setInputAmount] = useState(initialAmount)
  const [inputMint, setInputMint] = useState(initialInputMint)
  const [outputMint, setOutputMint] = useState(initialOutputMint)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txSignature, setTxSignature] = useState('')
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('Medium')
  const [priorityFee, setPriorityFee] = useState<number>(0)
  const [estimatingFee, setEstimatingFee] = useState(false)
  const { primaryWallet, walletAddress } = useCurrentWallet()

  // Update form when props change
  useEffect(() => {
    setInputMint(initialInputMint)
  }, [initialInputMint])

  useEffect(() => {
    setOutputMint(initialOutputMint)
  }, [initialOutputMint])

  useEffect(() => {
    setInputAmount(initialAmount)
  }, [initialAmount])

  const estimatePriorityFee = async (transaction: string) => {
    try {
      setEstimatingFee(true)
      const response = await fetch('/api/priority-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction,
          priorityLevel,
          options: {
            transactionEncoding: 'base64',
          },
        }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      // Set the estimated priority fee
      setPriorityFee(data.priorityFeeEstimate)
    } catch (err) {
      console.error('Failed to estimate priority fee:', err)
      setPriorityFee(0)
    } finally {
      setEstimatingFee(false)
    }
  }

  const handleSwap = async () => {
    if (!primaryWallet || !walletAddress) {
      setError('Wallet not connected')
      return
    }

    setLoading(true)
    try {
      // Show initial toast for quote fetching
      toast({
        title: 'Preparing Swap',
        description: 'Fetching the best quote for your swap...',
        variant: 'pending',
        duration: 2000,
      })

      // Calculate amount with correct decimals
      const multiplier = Math.pow(10, inputDecimals)
      const adjustedAmount = Number(inputAmount) * multiplier

      // Get quote with platform fees
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
          `&outputMint=${outputMint}&amount=${adjustedAmount}` +
          `&slippageBps=50` +
          `&platformFeeBps=${PLATFORM_FEE_BPS}`,
      ).then((res) => res.json())

      // Show toast for transaction building
      toast({
        title: 'Building Transaction',
        description: 'Preparing your swap transaction...',
        variant: 'pending',
        duration: 2000,
      })

      // Get swap transaction
      const { swapTransaction } = await fetch(
        'https://quote-api.jup.ag/v6/swap',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: walletAddress,
            wrapAndUnwrapSol: true,
            platformFee: {
              feeBps: PLATFORM_FEE_BPS,
              feeAccount: PLATFORM_FEE_ACCOUNT,
            },
            computeUnitPriceMicroLamports: priorityFee,
          }),
        },
      ).then((res) => res.json())

      // Deserialize transaction first
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(swapTransaction, 'base64'),
      )

      // Estimate priority fee using the serialized transaction
      await estimatePriorityFee(
        Buffer.from(transaction.serialize()).toString('base64'),
      )

      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        return
      }

      // Show sending transaction toast
      toast({
        title: 'Sending Transaction',
        description: 'Please approve the transaction in your wallet...',
        variant: 'pending',
        duration: 5000,
      })

      // Deserialize and sign transaction
      const signer = await primaryWallet.getSigner()
      const txid = await signer.signAndSendTransaction(transaction)

      setTxSignature(txid.signature)

      // Show confirming transaction toast
      toast({
        title: 'Confirming Transaction',
        description: (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Waiting for confirmation...</span>
          </div>
        ),
        variant: 'pending',
        duration: 5000,
      })

      const connection = await primaryWallet.getConnection()

      const tx = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      if (tx.value.err) {
        toast({
          title: 'Transaction Failed',
          description: 'The swap transaction failed. Please try again.',
          variant: 'error',
          duration: 5000,
        })
        setError('Transaction failed. Please try again.')
      } else {
        // Show success toast
        toast({
          title: 'Swap Successful',
          description: (
            <div>
              Successfully swapped {inputAmount} {inputTokenName} to{' '}
              {outputTokenName}
              <div className="mt-2">
                <a href={`/${txid.signature}`} className="text-sm underline">
                  View Transaction
                </a>
              </div>
            </div>
          ),
          variant: 'success',
          duration: 5000,
        })
      }

      console.log(tx)
    } catch (err) {
      console.error('Swap failed:', err)
      toast({
        title: 'Swap Failed',
        description: 'The swap transaction failed. Please try again.',
        variant: 'error',
        duration: 5000,
      })
      setError('Swap transaction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-green-900/10 rounded-lg space-y-4">
      <div className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Amount"
          className="bg-green-900/20 text-green-100 p-2 rounded"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <select
            className="bg-green-900/20 text-green-100 p-2 rounded flex-1"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
          >
            <option value={inputMint}>{inputTokenName}</option>
          </select>

          <span className="text-green-400">→</span>

          <select
            className="bg-green-900/20 text-green-100 p-2 rounded flex-1"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
          >
            <option value={outputMint}>{outputTokenName}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="bg-green-900/20 text-green-100 p-2 rounded flex-1"
            value={priorityLevel}
            onChange={(e) => setPriorityLevel(e.target.value as PriorityLevel)}
          >
            {PRIORITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <div className="text-xs text-green-500">
            {estimatingFee
              ? 'Estimating...'
              : priorityFee > 0
              ? `${priorityFee} µ◎`
              : 'Priority Level'}
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={loading || estimatingFee}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Swapping...' : 'Execute Swap'}
        </button>

        {error && <div className="text-red-400 text-sm">{error}</div>}
        {txSignature && (
          <div className="text-green-400 text-sm">
            Transaction:{' '}
            <a
              href={`https://solscan.io/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Solscan
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

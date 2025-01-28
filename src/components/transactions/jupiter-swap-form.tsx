import { useState } from 'react'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { formatLamportsToSol } from '@/utils/transaction'
import { VersionedTransaction } from '@solana/web3.js'
import { isSolanaWallet } from '@dynamic-labs/solana'

export const JupiterSwapForm = () => {
  const [inputAmount, setInputAmount] = useState('')
  const [inputMint, setInputMint] = useState(
    'So11111111111111111111111111111111111111112',
  )
  const [outputMint, setOutputMint] = useState(
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txSignature, setTxSignature] = useState('')
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const handleSwap = async () => {
    if (!primaryWallet || !walletAddress) {
      setError('Wallet not connected')
      return
    }

    setLoading(true)
    try {
      // Get quote
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
          `&outputMint=${outputMint}&amount=${
            Number(inputAmount) * 1000000000
          }` +
          `&slippageBps=50`,
      ).then((res) => res.json())

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
          }),
        },
      ).then((res) => res.json())
      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        return
      }

      // Deserialize and sign transaction
      const connection = await primaryWallet.getConnection()
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(swapTransaction, 'base64'),
      )
      const signer = await primaryWallet.getSigner()
      const txid = await signer.signAndSendTransaction(transaction)

      setTxSignature(txid.signature)
    } catch (err) {
      console.error('Swap failed:', err)
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
            <option value="So11111111111111111111111111111111111111112">
              SOL
            </option>
            {/* Add more token options */}
          </select>

          <span className="text-green-400">→</span>

          <select
            className="bg-green-900/20 text-green-100 p-2 rounded flex-1"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
          >
            <option value="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v">
              USDC
            </option>
            {/* Add more token options */}
          </select>
        </div>

        <button
          onClick={handleSwap}
          disabled={loading}
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

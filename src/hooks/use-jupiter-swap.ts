import { useState, useEffect } from 'react'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { VersionedTransaction } from '@solana/web3.js'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { useToast } from '@/hooks/use-toast'
import type { PriorityLevel, QuoteResponse } from '@/types/jupiter'
import {
  PLATFORM_FEE_BPS,
  PLATFORM_FEE_ACCOUNT,
  DEFAULT_PRIORITY_LEVEL,
  DEFAULT_SLIPPAGE_BPS,
} from '@/constants/jupiter'

interface UseJupiterSwapParams {
  inputMint: string
  outputMint: string
  inputAmount: string
  inputDecimals: number
  sourceWallet?: string
}

export function useJupiterSwap({
  inputMint,
  outputMint,
  inputAmount,
  inputDecimals,
  sourceWallet,
}: UseJupiterSwapParams) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txSignature, setTxSignature] = useState('')
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>(
    DEFAULT_PRIORITY_LEVEL,
  )
  const [priorityFee, setPriorityFee] = useState<number>(0)
  const [estimatingFee, setEstimatingFee] = useState(false)
  const { primaryWallet, walletAddress, mainUsername } = useCurrentWallet()
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(null)
  const [expectedOutput, setExpectedOutput] = useState<string>('')
  const [priceImpact, setPriceImpact] = useState<string>('')
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS)
  const [showTradeLink, setShowTradeLink] = useState(false)

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

      setPriorityFee(data.priorityFeeEstimate)
    } catch (err) {
      console.error('Failed to estimate priority fee:', err)
      setPriorityFee(0)
    } finally {
      setEstimatingFee(false)
    }
  }

  const fetchQuote = async () => {
    if (!inputAmount || !inputMint || !outputMint) return

    try {
      const multiplier = Math.pow(10, inputDecimals)
      const adjustedAmount = Number(inputAmount) * multiplier

      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
          `&outputMint=${outputMint}&amount=${adjustedAmount}` +
          `&slippageBps=${slippageBps}` +
          `&platformFeeBps=${PLATFORM_FEE_BPS}`,
      ).then((res) => res.json())

      setQuoteResponse(response)
      setExpectedOutput(
        (Number(response.outAmount) / Math.pow(10, 6)).toFixed(6),
      )
      setPriceImpact(response.priceImpactPct)
    } catch (err) {
      console.error('Failed to fetch quote:', err)
      setError('Failed to fetch quote. Please try again.')
    }
  }

  const handleSwap = async () => {
    if (!primaryWallet || !walletAddress) {
      setError('Wallet not connected')
      return
    }

    setLoading(true)
    try {
      toast({
        title: 'Preparing Swap',
        description: 'Fetching the best quote for your swap...',
        variant: 'pending',
        duration: 2000,
      })

      const multiplier = Math.pow(10, inputDecimals)
      const adjustedAmount = Number(inputAmount) * multiplier

      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
          `&outputMint=${outputMint}&amount=${adjustedAmount}` +
          `&slippageBps=${slippageBps}` +
          `&platformFeeBps=${PLATFORM_FEE_BPS}`,
      ).then((res) => res.json())

      toast({
        title: 'Building Transaction',
        description: 'Preparing your swap transaction...',
        variant: 'pending',
        duration: 2000,
      })

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

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(swapTransaction, 'base64'),
      )

      await estimatePriorityFee(
        Buffer.from(transaction.serialize()).toString('base64'),
      )

      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        return
      }

      toast({
        title: 'Sending Transaction',
        description: 'Please approve the transaction in your wallet...',
        variant: 'pending',
        duration: 5000,
      })

      const signer = await primaryWallet.getSigner()
      const txid = await signer.signAndSendTransaction(transaction)

      setTxSignature(txid.signature)

      toast({
        title: 'Confirming Transaction',
        description: 'Waiting for confirmation...',
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
        await createContentNode(txid.signature)
        showSuccessToast(txid.signature)
        setShowTradeLink(true)
      }
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

  const createContentNode = async (signature: string) => {
    try {
      // Fetch profiles for both wallets
      const [sourceWalletProfiles, walletProfiles] = await Promise.all([
        sourceWallet
          ? fetch(`/api/profiles?walletAddress=${sourceWallet}`).then((res) =>
              res.json(),
            )
          : Promise.resolve({ profiles: [] }),
        walletAddress
          ? fetch(`/api/profiles?walletAddress=${walletAddress}`).then((res) =>
              res.json(),
            )
          : Promise.resolve({ profiles: [] }),
      ])

      // Get main profiles (nemoapp namespace) for both wallets
      const sourceProfile = sourceWalletProfiles.profiles?.find(
        (p: any) => p.namespace.name === 'nemoapp',
      )?.profile
      const walletProfile = walletProfiles.profiles?.find(
        (p: any) => p.namespace.name === 'nemoapp',
      )?.profile

      // Fetch token information
      const [inputTokenResponse, outputTokenResponse] = await Promise.all([
        fetch(`/api/token?mint=${inputMint}`),
        fetch(`/api/token?mint=${outputMint}`),
      ])

      const inputTokenData = await inputTokenResponse.json()
      const outputTokenData = await outputTokenResponse.json()

      // Create content node with enhanced information
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: signature,
          profileId: mainUsername,
          properties: [
            { key: 'type', value: 'swap' },
            { key: 'inputMint', value: inputMint },
            { key: 'outputMint', value: outputMint },
            { key: 'inputAmount', value: inputAmount },
            { key: 'expectedOutput', value: expectedOutput },
            { key: 'priceImpact', value: priceImpact },
            {
              key: 'inputTokenSymbol',
              value: inputTokenData?.result?.content?.metadata?.symbol || '',
            },
            {
              key: 'inputTokenImage',
              value: inputTokenData?.result?.content?.links?.image || '',
            },
            {
              key: 'inputTokenDecimals',
              value: String(
                inputTokenData?.result?.token_info?.decimals || inputDecimals,
              ),
            },
            {
              key: 'outputTokenSymbol',
              value: outputTokenData?.result?.content?.metadata?.symbol || '',
            },
            {
              key: 'outputTokenImage',
              value: outputTokenData?.result?.content?.links?.image || '',
            },
            {
              key: 'outputTokenDecimals',
              value: String(outputTokenData?.result?.token_info?.decimals || 6),
            },
            { key: 'txSignature', value: signature },
            { key: 'timestamp', value: String(Date.now()) },
            { key: 'slippageBps', value: String(slippageBps) },
            { key: 'sourceWallet', value: sourceWallet || '' },
            { key: 'priorityLevel', value: priorityLevel },
            { key: 'priorityFee', value: priorityFee },
            { key: 'walletAddress', value: walletAddress },
            // Add profile information for source wallet
            {
              key: 'sourceWalletUsername',
              value: sourceProfile?.username || '',
            },
            { key: 'sourceWalletImage', value: sourceProfile?.image || '' },
            // Add profile information for wallet address
            { key: 'walletUsername', value: walletProfile?.username || '' },
            { key: 'walletImage', value: walletProfile?.image || '' },
            // Add token metadata
            {
              key: 'inputTokenName',
              value: inputTokenData?.result?.content?.metadata?.name || '',
            },
            {
              key: 'inputTokenDescription',
              value:
                inputTokenData?.result?.content?.metadata?.description || '',
            },
            {
              key: 'outputTokenName',
              value: outputTokenData?.result?.content?.metadata?.name || '',
            },
            {
              key: 'outputTokenDescription',
              value:
                outputTokenData?.result?.content?.metadata?.description || '',
            },
          ],
        }),
      })
    } catch (err) {
      console.error('Error creating content node:', err)
    }
  }

  const showSuccessToast = (signature: string) => {
    toast({
      title: 'Swap Successful',
      description: 'Transaction confirmed successfully!',
      variant: 'success',
      duration: 5000,
    })
  }

  useEffect(() => {
    fetchQuote()
  }, [inputAmount, inputMint, outputMint, slippageBps])

  return {
    loading,
    error,
    txSignature,
    priorityLevel,
    setPriorityLevel,
    priorityFee,
    estimatingFee,
    quoteResponse,
    expectedOutput,
    priceImpact,
    slippageBps,
    setSlippageBps,
    showTradeLink,
    handleSwap,
  }
}

'use client'

import {
  isValidSolanaAddress,
  isValidTransactionSignature,
} from '@/utils/validation'
import TransactionDetails from '@/components/TransactionDetails'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function AddressPage() {
  const params = useParams()
  const rawAddress = params.address as string
  const [error, setError] = useState<string | null>(null)
  const [addressType, setAddressType] = useState<
    'transaction' | 'wallet' | null
  >(null)

  useEffect(() => {
    try {
      // Clean up the address - remove @ symbol if present
      const cleanAddress = rawAddress.startsWith('@')
        ? rawAddress.slice(1)
        : rawAddress

      if (isValidTransactionSignature(cleanAddress)) {
        setAddressType('transaction')
        setError(null)
      } else if (isValidSolanaAddress(cleanAddress)) {
        setAddressType('wallet')
        setError(null)
      } else {
        setError('Invalid address format')
      }
    } catch (err) {
      setError('Invalid address format')
    }
  }, [rawAddress])

  // Clean up address for component props
  const cleanAddress = rawAddress.startsWith('@')
    ? rawAddress.slice(1)
    : rawAddress

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-red-500 font-mono text-xl">Error</div>
          <div className="text-green-400 font-mono text-center">{error}</div>
          <div className="text-green-600 font-mono text-sm text-center max-w-md">
            Please provide a valid Solana wallet address or transaction
            signature
          </div>
        </div>
      </div>
    )
  }

  if (!addressType) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-green-500 font-mono text-center">
          Validating address...
        </div>
      </div>
    )
  }

  if (addressType === 'transaction') {
    return <TransactionDetails signature={cleanAddress} />
  }

  // TODO: Implement wallet profile view
  return (
    <div className="container mx-auto p-8">
      <div className="text-green-500 font-mono">
        Wallet Profile View Coming Soon...
      </div>
      <div className="text-green-400 font-mono mt-2 break-all">
        Address: {cleanAddress}
      </div>
    </div>
  )
}

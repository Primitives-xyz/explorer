'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Blink,
  createSignMessageText,
  SignMessageData,
  SignMessageVerificationOptions,
  useBlink,
  useBlinksRegistryInterval,
  verifySignMessageData,
} from '@dialectlabs/blinks'
import { BlinkSolanaConfig } from '@dialectlabs/blinks-core/solana'
// import { useBlinkDappAdapter } from '@dialectlabs/blinks/hooks'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import '@dialectlabs/blinks/index.css'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useMemo, useState, useEffect } from 'react'

interface BlinkComponentProps {
  actionUrl: string
}

export const decodeBase64 = (str: string): Uint8Array => {
  const binary = atob(str)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  const half = binary.length / 2
  for (let i = 0, j = binary.length - 1; i <= half; i++, j--) {
    bytes[i] = binary.charCodeAt(i)
    bytes[j] = binary.charCodeAt(j)
  }
  return bytes
}

export const verifySignDataValidity = (
  data: string | SignMessageData,
  opts: SignMessageVerificationOptions
) => {
  if (typeof data === 'string') {
    // skip validation for string
    return true
  }
  const errors = verifySignMessageData(data, opts)
  if (errors.length > 0) {
    console.warn(
      `[@dialectlabs/blinks] Sign message data verification error: ${errors.join(
        ', '
      )}`
    )
  }
  return errors.length === 0
}

export function BlinkComponent({ actionUrl }: BlinkComponentProps) {
  useBlinksRegistryInterval()
  const [resolvedAdapter, setResolvedAdapter] = useState<BlinkSolanaConfig | null>(null)
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const adapterPromise = useMemo(async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) return null

    const signer = await primaryWallet.getSigner()

    const finalConnection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    )

    return new BlinkSolanaConfig(finalConnection, {
      connect: async () => {
        if (walletAddress.length > 0) {
          return walletAddress
        }
        return null
      },
      signTransaction: async (txData: string) => {
        try {
          const tx = await signer.signAndSendTransaction(
            VersionedTransaction.deserialize(decodeBase64(txData)) as any
          )
          return { signature: tx?.signature ?? '' }
        } catch {
          return { error: 'Signing failed.' }
        }
      },
      signMessage: async (
        data: string | SignMessageData
      ): Promise<
        | { signature: string }
        | {
            error: string
          }
      > => {
        if (!signer.signMessage) {
          return { error: 'Signing failed.' }
        }
        try {
          // Optional data verification before signing
          const isSignDataValid = verifySignDataValidity(data, {
            expectedAddress: walletAddress,
          })
          if (!isSignDataValid) {
            return { error: 'Signing failed.' }
          }
          const text =
            typeof data === 'string' ? data : createSignMessageText(data)
          const signed = await signer.signMessage(
            new TextEncoder().encode(text)
          )
          return { signature: Buffer.from(signed.signature).toString('base64') }
        } catch (e) {
          return { error: 'Signing failed.' }
        }
      },
    })
  }, [primaryWallet])

  useEffect(() => {
    adapterPromise.then(setResolvedAdapter)
  }, [adapterPromise])

  const { blink, isLoading } = useBlink({
    url: `solana-action:${actionUrl}`,
  })

  return (
    <div>
      {isLoading ? (
        <div>
          <Skeleton className="w-full h-[600px] rounded-lg bg-neutral-800" />
        </div>
      ) : (
        <> {blink && resolvedAdapter && <Blink blink={blink} adapter={resolvedAdapter} stylePreset='x-dark'/>}</>
      )}
    </div>
  )
}

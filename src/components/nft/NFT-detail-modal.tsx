'use client'

import { Connection, VersionedTransaction } from '@solana/web3.js'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { CopyPaste } from '@/components/common/copy-paste'
import { useToast } from '@/hooks/use-toast'
import { CollectionListItem } from '@/types/nft/magic-eden'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'

interface NFTDetailModalProps {
  selectedNft: CollectionListItem | null
  isOpen: boolean
  onClose: () => void
}

export default function NFTDetailModal({
  selectedNft,
  isOpen,
  onClose,
}: NFTDetailModalProps) {
  const { toast } = useToast()
  const t = useTranslations()
  const { primaryWallet, walletAddress } = useCurrentWallet()

  // Loading state
  const [showNftBuyLoading, setShowNftBuyLoading] = useState<boolean>(false)

  const handleNftBuy = async () => {
    try {
      if (!selectedNft) {
        toast({
          title: 'NFT Buy Error',
          description: 'Please select a NFT to purchase',
          variant: 'pending',
          duration: 1000000000,
        })
        return
      }

      setShowNftBuyLoading(true)

      const { seller, auctionHouse, tokenMint, price } = selectedNft
      const buyNftApiRes = await fetch(
        `/api/magiceden/instructions/buy_now?buyer=${walletAddress}&seller=${seller}&auctionHouseAddress=${auctionHouse}&tokenMint=${tokenMint}&tokenATA=${tokenMint}&price=${price}`
      )

      const buyNftApiResData = await buyNftApiRes.json()
      const buyTxData = buyNftApiResData.buyTx
      const serializedBuffer = Buffer.from(buyTxData, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      const simulateTx = await connection.simulateTransaction(vtx, {
        replaceRecentBlockhash: true,
      })
      console.log('simulateTx:', simulateTx)

      const buyTxid = await signer.signAndSendTransaction(vtx)

      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      const tx = await connection.confirmTransaction({
        signature: buyTxid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      confirmToast.dismiss()

      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_buy_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_buy_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_buy_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftBuyLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative max-w-4xl flex items-center justify-center w-full p-4 bg-black/90 border border-green-800 rounded-lg h-[520px] overflow-y-auto">
        <div
          className="w-[20px] h-[20px] absolute right-[10px] top-[10px] font-bold text-center leading-[100%] text-lg border border-green-800 rounded-sm cursor-pointer"
          onClick={onClose}
        >
          X
        </div>
        {selectedNft ? (
          <div className="flex flex-col gap-6 md:flex-row h-full">
            <div className="md:w-2/5">
              <Link href={selectedNft.extra.img} target="_blank">
                <Image
                  src={selectedNft.extra.img}
                  alt={selectedNft.token.name}
                  className="rounded-lg"
                  width={500}
                  height={500}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement?.classList.add(
                      'min-h-[200px]',
                      'flex',
                      'items-center',
                      'justify-center'
                    )
                    target.insertAdjacentHTML(
                      'afterend',
                      `<div className="font-mono text-sm">Image failed to load</div>`
                    )
                  }}
                />
              </Link>
              <button
                className="w-full flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-1 cursor-pointer"
                disabled={showNftBuyLoading}
                onClick={handleNftBuy}
              >
                {showNftBuyLoading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </>
                ) : (
                  <>
                    <span className="font-mono font-medium uppercase">Buy</span>
                  </>
                )}
              </button>
            </div>

            <div className="md:w-3/5">
              <h2 className="text-xl font-bold text-green-500">
                {selectedNft.token.name}
              </h2>
              <div className="border border-green-500 mt-5 p-2 rounded-lg">
                <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                  Details
                </h3>
                <div className="flex flex-col gap-2 text-sm mt-2">
                  <div className="flex justify-between items-center gap-1 uppercase">
                    <div>Price</div>
                    <div className="flex gap-1">
                      <p className="text-green-500">{selectedNft.price} SOL</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-1 uppercase">
                    <div>Mint Address</div>
                    <div className="flex gap-1">
                      <p className="text-green-500">{selectedNft.token.name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-1 uppercase">
                    <div>Owner</div>
                    <div className="flex gap-1">
                      <p className="text-green-500">
                        {selectedNft.token.owner}
                      </p>
                      <CopyPaste content={selectedNft.token.owner} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-1 uppercase">
                    <div>COLLECTION ADDRESS</div>
                    <div className="flex gap-1">
                      <p className="text-green-500">
                        {selectedNft.token.updateAuthority}
                      </p>
                      <CopyPaste content={selectedNft.token.updateAuthority} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-1 uppercase">
                    <div>ROYALTIES</div>
                    <div className="flex gap-1">
                      <p className="text-green-500">
                        {selectedNft.token.sellerFeeBasisPoints}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-green-500 mt-5 p-2 rounded-lg">
                <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                  Attributes
                </h3>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {selectedNft.token.attributes?.map(
                    (
                      attr: { trait_type: string; value: string },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group"
                      >
                        <div className="text-sm text-green-500 mb-1 font-mono">
                          {attr.trait_type}
                        </div>
                        <div className="text-sm font-mono group-hover: transition-colors">
                          {attr.value}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="h-[20px]"></div>
            </div>
          </div>
        ) : (
          <Loader2 className="h-10 w-10 animate-spin" />
        )}
      </div>
    </div>
  )
}

import { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'
import { CopyPaste } from '../common/copy-paste'
import { useWallet } from '../auth/wallet-context'
import { FungibleTokenInfo, NFTTokenInfo } from '@/types/Token'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { VersionedTransaction } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  symbol: string
  token?: NFT | TokenWithInscription | FungibleToken // Adding typed NFT parameter
}

export const ImageModal = ({ isOpen, onClose, imageUrl, symbol, token }: ImageModalProps) => {
  if (!isOpen) return null
  const { primaryWallet, walletAddress } = useWallet()
  const { toast } = useToast()
  const t = useTranslations()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [tokenType, setTokenType] = useState<string | null>(null)
  const [showNftSellLoading, setShowNftSellLoading] = useState<boolean>(false)

  // Add handler for nft sell
  const handleNftSell = async () => {
    try {
      // setShowNftSellLoading(true)
      const bestOfferRes = await fetch(`api/magiceden/mmm/token/${tokenInfo.id}/pools`)
      const bestOfferData = await bestOfferRes.json()

      console.log("------------------------------------------")
      console.log(bestOfferData)

      // const query = {
      //   pool: bestOfferData.pool,
      //   minPaymentAmount: bestOfferData.minPaymentAmount,
      //   seller: walletAddress,
      //   assetMint: tokenInfo.id,
      //   assetTokenAccount: tokenInfo.id,
      //   assetAmount: 1
      // }

      // const sellNftRes = await fetch(`/api/magiceden/mmm/sol-fulfill-buy?pool=${query.pool}&minPaymentAmount=${query.minPaymentAmount}&seller=${query.seller}&assetMint=${query.assetMint}&assetTokenAccount=${query.assetTokenAccount}&assetAmount=${query.assetAmount}`, {
      //   method: 'GET',
      //   headers: {
      //     "ccept": "application/json"
      //   }
      // })

      // const sellNftResData = await sellNftRes.json()
      // console.log("++++++++++++++++++++", sellNftResData)

      // const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
      // const sellTxData = sellNftResData.sellTx
      // const serializedBuffer = Buffer.from(sellTxData, 'base64')
      // const vtx: VersionedTransaction = VersionedTransaction.deserialize(
      //   Uint8Array.from(serializedBuffer)
      // )

      // const signer = await primaryWallet.getSigner()

      // // simulate sellTx
      // const simulateTx = await connection.simulateTransaction(vtx, { replaceRecentBlockhash: true })
      // console.log('sim:', simulateTx)

      // const sellTxid = await signer.signAndSendTransaction(vtx)
      // const confirmToast = toast({
      //   title: t('trade.confirming_transaction'),
      //   description: t('trade.waiting_for_confirmation'),
      //   variant: 'pending',
      //   duration: 1000000000,
      // })

      // const tx = await connection.confirmTransaction({
      //   signature: sellTxid.signature,
      //   ...(await connection.getLatestBlockhash()),
      // })

      // confirmToast.dismiss()

      // if (tx.value.err) {
      //   toast({
      //     title: t('trade.transaction_failed'),
      //     description: t('trade.the_sell_transaction_failed_please_try_again'),
      //     variant: 'error',
      //     duration: 5000,
      //   })
      // } else {
      //   toast({
      //     title: t('trade.transaction_successful'),
      //     description: t(
      //       'trade.the_sell_transaction_was_successful_creating_shareable_link'
      //     ),
      //     variant: 'success',
      //     duration: 5000,
      //   })
      // }

      // setShowNftSellLoading(false)
    } catch (error) {
      console.log('Error in making stake tx:', error)
      setShowNftSellLoading(false)
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_sell_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    }
  }

  useEffect(() => {
    (async () => {
      if (token) {
        try {
          const response = await fetch(`/api/token?mint=${token.id}`)
          const tInfo = await response.json()
          console.log("tInfo:", tInfo)
          if (['V1_NFT', 'V2_NFT', 'ProgrammableNFT', 'LEGACY_NFT', 'MplCoreAsset'].includes(token.interface)) {
            setTokenInfo(tInfo?.result as NFTTokenInfo)
            setTokenType("NFT")
          } else if (['FungibleToken', 'FungibleAsset'].includes(token.interface)) {
            setTokenInfo(tInfo?.result as FungibleTokenInfo)
            setTokenType("FT")
          }
        } catch (error) {
          console.log("Error in fetching token info")
        }
      }
    })()
  }, [walletAddress, token])

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="relative max-w-4xl flex items-center justify-center w-full p-4 bg-black/90 border border-green-800 rounded-lg h-[520px] overflow-y-auto">
        <div className='w-[20px] h-[20px] absolute right-[10px] top-[10px] font-bold text-center leading-[100%] text-lg border border-green-800 rounded-sm cursor-pointer' onClick={onClose}>X</div>
        {tokenInfo ? (
          tokenType == "NFT" ? (
            <div className="flex flex-col gap-6 md:flex-row h-full">
              <div className="md:w-2/5">
                {imageUrl ? (
                  <Link href={imageUrl} target='_blank'>
                    <img
                      src={imageUrl}
                      alt={symbol}
                      className="rounded-lg"
                      onError={(e) => {
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
                    /></Link>

                ) : (
                  <div className="min-h-[200px] rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 flex items-center justify-center">
                    <div className="font-mono text-sm">No image available</div>
                  </div>
                )}
                <div
                  className='flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-1 cursor-pointer'
                  onClick={handleNftSell}
                >
                  <span className='font-mono font-medium uppercase'>sell</span>
                </div>
                <div className='border border-green-500 my-1 p-2 rounded-lg'>
                  <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                    Description
                  </h3>
                  {tokenInfo && tokenInfo.content?.metadata?.description && (
                    <div className="mt-2">
                      <p className="font-mono text-base text-gray-300 max-h-24 overflow-y-auto">
                        {tokenInfo.content?.metadata.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-3/5">
                <h2 className="text-xl font-bold text-green-500">{tokenInfo.content.metadata.name} | NFT</h2>

                <div className="flex items-center gap-1">
                  <p className="text-sm">{tokenInfo.id}</p>
                  <CopyPaste content={tokenInfo.id} />
                </div>

                <div className='border border-green-500 mt-5 p-2 rounded-lg'>
                  <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                    Details
                  </h3>
                  <div className='flex flex-col gap-2 text-sm mt-2'>
                    <div className="flex justify-between items-center gap-1 uppercase">
                      <div>Owner</div>
                      <div className='flex gap-1'>
                        <p className='text-green-500'>{walletAddress}</p>
                        <CopyPaste content={walletAddress} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-1 uppercase">
                      <div>Mint Address</div>
                      <div className='flex gap-1'>
                        <p className='text-green-500'>{tokenInfo.content.metadata.name}</p>
                        <CopyPaste content={tokenInfo.id} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-1 uppercase">
                      <div>Mint Authority</div>
                      {tokenInfo.authorities.map(
                        (
                          authority: { address: string; scopes: string[] },
                          i: number
                        ) => (
                          <div className='flex gap-1'>
                            <p className='text-green-500'>{authority.address}</p>
                            <CopyPaste content={authority.address} />
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex justify-between items-center gap-1 uppercase">
                      <div>COLLECTION ADDRESS</div>
                      <div className='flex gap-1'>
                        <p className='text-green-500'>{tokenInfo.grouping?.find(
                          (g: { group_key: string; group_value: string }) =>
                            g.group_key === 'collection'
                        )?.group_value || 'None'}</p>
                        <CopyPaste content={tokenInfo.grouping?.find(
                          (g: { group_key: string; group_value: string }) =>
                            g.group_key === 'collection'
                        )?.group_value || 'None'} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-1 uppercase">
                      <div>TOKEN STANDARD</div>
                      <div className='flex gap-1'>
                        <p className='text-green-500'>
                          {tokenInfo.compression?.compressed ? 'Compressed NFT' : 'Regular NFT'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-1 uppercase">
                      <div>ROYALTIES</div>
                      <div className='flex gap-1'>
                        <p className='text-green-500'>
                          {tokenInfo.royalty?.percent ? tokenInfo.royalty.percent * 100 : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='border border-green-500 mt-5 p-2 rounded-lg'>
                  <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                    TOKEN CREATORS
                  </h3>
                  <div className='text-sm mt-2'>
                    <div className="flex justify-between items-center gap-1 uppercase">
                      {tokenInfo.creators ? (
                        tokenInfo.creators.map(
                          (
                            creator: {
                              address: string
                              share?: number
                              verified?: boolean
                            },
                            index: number
                          ) => (
                            <div key={index} className='w-full flex flex-row justify-between'>
                              <div className='flex gap-1'>
                                <p className='text-green-500'>{creator.address}</p>
                                <CopyPaste content={creator.address} />
                              </div>
                              <span>{creator.share || 0}%</span>
                            </div>
                          )
                        )
                      ) : (
                        <div className='w-full flex flex-row justify-between'>
                          <div className='flex gap-1'>
                            <p className='text-green-500'>NONE</p>
                            <CopyPaste content="NONE" />
                          </div>
                          <span>0%</span>
                        </div>
                      )
                      }
                    </div>
                  </div>
                </div>
                <div className='border border-green-500 mt-5 p-2 rounded-lg'>
                  <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                    Attributes
                  </h3>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {tokenInfo.content.metadata.attributes?.map(
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
                <div className='h-[20px]'></div>
              </div>
            </div>
          ) : (
            <span>Coming Soon...</span>
          )
        ) : (
          <Loader2 className="h-10 w-10 animate-spin" />
        )}
      </div>
    </div>
  )
}

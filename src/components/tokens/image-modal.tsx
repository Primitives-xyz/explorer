import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { VersionedTransaction, Connection } from '@solana/web3.js'
import { Loader2 } from 'lucide-react'

import { useToast } from '@/hooks/use-toast'
import { useWallet } from '../auth/wallet-context'

import { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'
import { FungibleTokenInfo, NFTTokenInfo } from '@/types/Token'

import { CopyPaste } from '../common/copy-paste'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  symbol: string
  token?: NFT | TokenWithInscription | FungibleToken // Adding typed NFT parameter
}

interface NFTPoolInfo {
  pool: string
  minPaymentAmount: number
}

interface OfferInterface {
  pdaAddress: string
  tokenMint: string
  auctionHouse: string
  buyer: string,
  buyerReferral: string,
  tokenSize: number
  price: number,
  expiry: number
}

export const ImageModal = ({ isOpen, onClose, imageUrl, symbol, token }: ImageModalProps) => {
  if (!isOpen) return null
  const { primaryWallet, walletAddress } = useWallet()
  const { toast } = useToast()
  const t = useTranslations()

  // Loading & UI states
  const [showNftListLoading, setShowNftListLoading] = useState<boolean>(false)
  const [showNftSellLoading, setShowNftSellLoading] = useState<boolean>(false)

  // Token-related states
  const [listAmount, setListAmount] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [tokenType, setTokenType] = useState<string | null>(null)
  const [collectionSymbol, setCollectionSymbol] = useState<string | null>(null)

  // Auction-related states
  const [auctionHose, setAuctionHouse] = useState<string | null>(null)
  const [bestSellOffer, setBestSellOffer] = useState<OfferInterface | null>(null)

  const validateAmount = (value: string): boolean => {
    // Empty check
    if (value === '') return false;

    // Convert to number and check if it's valid
    const numericValue = Number(value);

    // Check if NaN or not positive
    if (isNaN(numericValue) || numericValue <= 0) {
      return false;
    }

    return true;
  };

  const handleNftList = async () => {
    try {
      setShowNftListLoading(true)

      if (!token || !auctionHose) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_list_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      if (!validateAmount(listAmount)) {
        toast({
          title: "List Amount Error",
          description: "Invalid List Amount. Please try to input again",
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Step 1: Fetch listing transaction from backend
      const listRes = await fetch(
        `/api/magiceden/instructions/list?seller=${walletAddress}&auctionHouseAddress=${auctionHose}&tokenMint=${token.id}&tokenAccount=${token.id}&price=${Number(listAmount)}`
      )
      const listResData = await listRes.json()

      // Step 2: Deserialize the transaction
      const serializedBuffer = Buffer.from(listResData.listTx, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      // Step 3: Get wallet signer & RPC connection
      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      // Step 4: Simulate the transaction (optional debugging step)
      const simulateTx = await connection.simulateTransaction(vtx, { replaceRecentBlockhash: true })
      console.log("Simulation result:", simulateTx)

      // Step 5: Sign & send the transaction
      const listTxid = await signer.signAndSendTransaction(vtx)

      // Step 6: Show "confirming transaction" toast
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      // Step 7: Confirm the transaction
      const latestBlockhash = await connection.getLatestBlockhash()
      const tx = await connection.confirmTransaction({
        signature: listTxid.signature,
        ...latestBlockhash,
      })

      // Step 8: Dismiss the confirmation toast
      confirmToast.dismiss()

      // Step 9: Handle transaction success or failure
      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_list_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_list_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_list_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftListLoading(false)
    }
  }

  const handleNftSell = async () => {
  }

  useEffect(() => {
    (async () => {
      if (!token) return

      try {
        // Fetch token information
        const response = await fetch(`/api/token?mint=${token.id}`)
        const tInfo = await response.json()

        // Determine token type
        if (['V1_NFT', 'V2_NFT', 'ProgrammableNFT', 'LEGACY_NFT', 'MplCoreAsset'].includes(token.interface)) {
          setTokenInfo(tInfo?.result as NFTTokenInfo)
          setTokenType("NFT")
        } else if (['FungibleToken', 'FungibleAsset'].includes(token.interface)) {
          setTokenInfo(tInfo?.result as FungibleTokenInfo)
          setTokenType("FT")
        }

        // Fetch collection symbol if available
        const collectionAddy = tInfo?.result.grouping?.find(
          (g: { group_key: string; group_value: string }) => g.group_key === 'collection'
        )?.group_value

        if (collectionAddy) {
          const getCollectionSymbolRes = await fetch(`/api/magiceden/collection/${collectionAddy}`)
          const collectionSymbolData = await getCollectionSymbolRes.json()
          setCollectionSymbol(collectionSymbolData.collectionSymbol)
        }

        // Fetch Best Buy Offer for nft
        const bestOfferRes = await fetch(`/api/magiceden/tokens/${token.id}/offers_received`)
        const bestOfferResData = await bestOfferRes.json()
        setBestSellOffer(bestOfferResData.bestOffer)
      } catch (error) {
        console.error("Error fetching token info:", error)
      }
    })()
  }, [token])

  useEffect(() => {
    (async () => {
      if (!collectionSymbol) return

      try {
        const auctionHouseRes = await fetch(`/api/magiceden/collection/${collectionSymbol}/auctionHose`)
        const auctionHouseResData = await auctionHouseRes.json()
        setAuctionHouse(auctionHouseResData.auctionHouse)
      } catch (error) {
        console.error("Error fetching auction house info:", error)
      }
    })()

  }, [collectionSymbol])

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
                <button
                  className='w-full flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-2 cursor-pointer'
                  disabled={showNftSellLoading || !bestSellOffer}
                  onClick={handleNftSell}
                >
                  {
                    showNftSellLoading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span className='font-mono font-medium uppercase'>
                          {bestSellOffer ? "Instant Sell" : "No Offers"}
                        </span>
                      </>
                    )
                  }
                </button>
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

                <div className='my-[10px]'>
                  <div className="bg-green-900/20 rounded-lg w-full transition-all duration-200 border border-green-500/20 focus-within:border-green-500/30 focus-within:ring-2 focus-within:ring-green-500/20 p-1">
                    <div className="flex flex-row items-baseline justify-between">
                      <input
                        inputMode="decimal"
                        placeholder="0.00"
                        className="bg-transparent text-base w-full font-medium placeholder:text-green-100/30 outline-none"
                        type="text"
                        onChange={(e) => {
                          const value = e.target.value
                          if (
                            value === '' ||
                            value === '.' ||
                            /^[0]?\.[0-9]*$/.test(value) ||
                            /^[0-9]*\.?[0-9]*$/.test(value)
                          ) {
                            const cursorPosition = e.target.selectionStart
                            setListAmount(value)
                            window.setTimeout(() => {
                              e.target.focus()
                              e.target.setSelectionRange(cursorPosition, cursorPosition)
                            }, 0)
                          }
                        }}
                        value={listAmount}
                      />
                    </div>
                  </div>
                  <button
                    className='w-full flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-1 cursor-pointer'
                    disabled={showNftListLoading}
                    onClick={handleNftList}
                  >
                    {
                      showNftListLoading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </>
                      ) : (
                        <><span className='font-mono font-medium uppercase'>List</span></>
                      )
                    }
                  </button>
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

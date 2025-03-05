import { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'
import { CopyPaste } from '../common/copy-paste'
import { useWallet } from '../auth/wallet-context'
import { NFTTokenInfo, TokenInfo } from '@/types/Token'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  symbol: string
  nft?: NFT | TokenWithInscription | FungibleToken // Adding typed NFT parameter
}

export const ImageModal = ({ isOpen, onClose, imageUrl, symbol, nft }: ImageModalProps) => {
  if (!isOpen) return null
  const { walletAddress } = useWallet()
  const [tokenInfo, setTokenInfo] = useState<NFTTokenInfo | null>(null)

  useEffect(() => {
    (async () => {
      if (nft) {
        const response = await fetch(`/api/token?mint=${nft.id}`)
        const tInfo = await response.json()
        setTokenInfo(tInfo?.result)
      }
    })()
  }, [walletAddress])

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-4xl flex items-center justify-center w-full mx-4 max-h-[500px] min-h-[500px] overflow-y-auto
      bg-black/90 border border-green-800 rounded-lg">
        <div
          className="p-4 relative flex justify-center items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {tokenInfo ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image section */}
              <div className="md:w-2/5">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={symbol}
                    className="w-full rounded-lg"
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
                  />
                ) : (
                  <div className="min-h-[200px] rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 flex items-center justify-center">
                    <div className="font-mono text-sm">No image available</div>
                  </div>
                )}
                <div className='border border-green-500 mt-[30px] rounded-lg px-4 py-2'>
                  <h3 className="text-lg font-bold text-green-500 py-1 border-b-2 border-green-500/30 uppercase">
                    Description
                  </h3>
                  {tokenInfo && tokenInfo.content?.metadata?.description && (
                    <div className="mt-2">
                      <p className="text-base text-gray-300 max-h-24 overflow-y-auto pr-2">
                        {tokenInfo.content?.metadata.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {tokenInfo && (
                <div className="md:w-3/5">
                  <h2 className="text-xl font-bold text-green-500">{tokenInfo.content.metadata.name}({tokenInfo.content.metadata.symbol})</h2>

                  {/* NFT MINT ADDRESS  */}
                  <div className="flex items-center gap-1">
                    <p className="text-sm">{tokenInfo.id}</p>
                    <CopyPaste content={tokenInfo.id} />
                  </div>

                  {/* NFT DETAILS */}
                  <div className='border border-green-500 mt-[30px] p-2 rounded-lg'>
                    <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                      Details
                    </h3>
                    <div className='flex flex-col gap-2 p-1 text-sm'>
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
                          {
                            tokenInfo.grouping?.find(
                              (g: { group_key: string; group_value: string }) =>
                                g.group_key === 'collection'
                            )?.group_value || 'None'
                          }
                          <CopyPaste content={tokenInfo.grouping?.find(
                            (g: { group_key: string; group_value: string }) =>
                              g.group_key === 'collection'
                          )?.group_value || 'None'} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        <div>TOKEN STANDARD</div>
                        <div className='flex gap-1'>
                          {
                            tokenInfo.compression?.compressed ? 'Compressed NFT' : 'Regular NFT'
                          }
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        <div>ROYALTIES</div>
                        <div className='flex gap-1'>
                          {tokenInfo.royalty?.percent ? tokenInfo.royalty.percent * 100 : 0}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='border border-green-500 mt-[30px] p-2 rounded-lg'>
                    <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                      TOKEN CREATORS
                    </h3>
                    <div className='p-1 text-sm'>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        {tokenInfo.creators?.map(
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
                        )}

                      </div>
                    </div>
                  </div>
                  <div className='border border-green-500 mt-[30px] p-2 rounded-lg'>
                    <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                      Attributes
                    </h3>
                    <div className="grid grid-cols-4 gap-2 mt-5">
                      {tokenInfo.content.metadata.attributes?.map(
                        (
                          attr: { trait_type: string; value: string },
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group"
                          >
                            <h4 className="/60 text-xs mb-1 font-mono">
                              {attr.trait_type}
                            </h4>
                            <p className=" font-mono group-hover: transition-colors">
                              {attr.value}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
              <Loader2 className="h-10 w-10 animate-spin" />
          )}
        </div>
      </div>
    </div>
  )
}

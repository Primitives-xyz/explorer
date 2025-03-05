import { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'
import { TokenAddress } from './token-address'
import { CopyPaste } from '../common/copy-paste'
import { useWallet } from '../auth/wallet-context'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import { TokenInfo } from '@/types/Token'
import { useEffect, useState } from 'react'

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
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)

  // useEffect(() => {
  //   (async () => {
  //     if (nft) {
  //       const tInfo = await fetchTokenInfo(nft.id)
  //       console.log("tokenInfo: ", tInfo)
  //       setTokenInfo(tokenInfo)
  //     }
  //   })()
  // }, [walletAddress])

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full mx-4">
        <div
          className="bg-black/90 border border-green-800 rounded-lg p-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image section */}
            <div className="md:w-2/5">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={symbol}
                  className="w-full h-auto rounded-lg"
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
                <h3 className="text-lg font-bold text-green-500 py-1 border-b-2 border-green-500/30">
                  Description
                </h3>
                {nft && nft.content?.metadata?.description && (
                  <div className="mt-2">
                    <p className="text-base text-gray-300 max-h-24 overflow-y-auto pr-2">
                      {nft.content.metadata.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {nft && (
              <div className="md:w-3/5">
                <h2 className="text-xl font-bold text-green-500">{nft.name}({nft.symbol})</h2>

                {/* NFT MINT ADDRESS  */}
                {nft.mint && (
                  <div className="flex items-center gap-1">
                    <p className="text-sm">{nft.mint}</p>
                    <CopyPaste content={nft.mint} />
                  </div>
                )}

                {/* NFT DETAILS */}
                <div className='border border-green-500 mt-[30px] p-2 rounded-lg'>
                  <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30">
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
                        <p className='text-green-500'>{nft.name}</p>
                        <CopyPaste content={nft.mint} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-1 uppercase">
                    </div>
                  </div>

                  {nft && nft.content?.metadata?.description && (
                    <div className="mt-2">
                      <p className="text-base text-gray-300 max-h-24 overflow-y-auto pr-2">
                        {nft.content.metadata.description}
                      </p>
                    </div>
                  )}
                </div>


                {/* Creator */}
                {nft.creators && nft.creators.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-green-500 mb-1">
                      Creator
                    </h3>
                    <div className="flex items-center">
                      {typeof nft.creators[0] === 'string' ? (
                        <div className="text-sm">
                          <TokenAddress address={nft.creators[0]} />
                        </div>
                      ) : (
                        <span className="text-sm">Unknown</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Attributes */}
                {/* {attributes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-green-500 mb-1">
                      Attributes
                    </h3>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                      {attributes.map(
                        (
                          attr: { trait_type: string; value: string },
                          idx: number
                        ) => (
                          <div
                            key={idx}
                            className="bg-green-900/20 rounded-md p-2 text-sm"
                          >
                            <div className="text-green-400 text-xs">
                              {attr.trait_type}
                            </div>
                            <div className="font-medium">{attr.value}</div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )} */}

                {/* External Link */}
                {nft.content?.links?.external_url && (
                  <div>
                    <h3 className="text-sm font-medium text-green-500 mb-1">
                      External Link
                    </h3>
                    <a
                      href={nft.content.links.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm"
                    >
                      {nft.content.links.external_url}
                    </a>
                  </div>
                )}

                {/* NFT Type Badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {nft.compressed && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-md">
                      Compressed NFT
                    </span>
                  )}
                  {'inscription' in nft && (
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md">
                      Inscription #{nft.inscription.order}
                    </span>
                  )}
                  {nft.mutable && (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-md">
                      Mutable
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">
                    {nft.interface}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

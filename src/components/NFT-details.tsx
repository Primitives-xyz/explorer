'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { DAS } from 'helius-sdk'
import { Loader2 } from 'lucide-react'

import { CopyPaste } from '@/components/common/copy-paste'
import { TransactionSection } from '@/components/transaction-section'
import type { NFTTokenInfo } from '@/types/Token'
import { useWallet } from './auth/wallet-context'
import { useNftListing } from '@/hooks/use-nft-listing'
import { useNftSell } from '@/hooks/use-nft-sell'

enum NFTTab {
  Transaction = 'transaction',
  Technical = 'technical',
}

export default function NFTDetails({ tokenInfo }: { tokenInfo: NFTTokenInfo }) {
  const { primaryWallet, walletAddress } = useWallet()
  const { handleNftList, listAmount, setListAmount, showNftListLoading } = useNftListing(tokenInfo, walletAddress, primaryWallet)
  const { handleNftSell, showNftSellLoading, bestSellOffer } = useNftSell(tokenInfo, walletAddress, primaryWallet)
  const [isNftOwner, setIsNftOwner] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<NFTTab>(NFTTab.Technical)

  const getTabStyle = (tab: NFTTab) => {
    const isActive = activeTab === tab

    return `font-mono text-sm py-1 cursor-pointer uppercase ${isActive ? 'font-bold text-green-500 border-b border-b-green-500' : ''
      }`
  }

  const renderTechnicalTab = () => (
    <>
      <div className="border border-green-500 mt-5 p-2 rounded-lg">
        <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
          schema & rpc
        </h3>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
            <div className="text-sm text-green-500 mb-1 font-mono">schema</div>
            <div className="text-sm font-mono group-hover: transition-colors">
              {tokenInfo.content.$schema?.toString() || 'NONE'}
            </div>
          </div>
          <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
            <div className="text-sm text-green-500 mb-1 font-mono">
              json rpc
            </div>
            <div className="text-sm font-mono">
              {tokenInfo.content.json_uri?.toString() || 'NONE'}
            </div>
          </div>
        </div>
      </div>
      <div className="border border-green-500 mt-5 p-2 rounded-lg">
        <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
          compression details
        </h3>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {tokenInfo.compression &&
            Object.keys(tokenInfo.compression).map((key, indx) => (
              <>
                <div
                  key={indx}
                  className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group"
                >
                  <div className="text-sm text-green-500 mb-1 font-mono">
                    {key}
                  </div>
                  <div className="text-sm font-mono group-hover: transition-colors">
                    {tokenInfo.compression?.[
                      key as keyof typeof tokenInfo.compression
                    ]?.toString() || 'NONE'}
                  </div>
                </div>
              </>
            ))}
        </div>
      </div>
      <div className="space-y-6">
        {tokenInfo.content.files && tokenInfo.content.files.length > 0 && (
          <div className="border border-green-500 mt-5 p-2 rounded-lg">
            <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
              Files details
            </h3>
            <div className="flex flex-col gap-2 mt-2">
              {tokenInfo.content.files.map((file: DAS.File, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group"
                >
                  <div className="grid grid-cols-1 gap-1">
                    <div>
                      <span className="text-sm text-green-500 mb-1 font-mono">
                        URI
                      </span>
                      <div className="text-sm mb-1 font-mono">{file.uri}</div>
                    </div>
                    {file.cdn_uri && (
                      <div className="md:col-span-2">
                        <span className="text-sm text-green-500 mb-1 font-mono">
                          CDN URI
                        </span>
                        <div className="font-mono  break-all text-sm">
                          {file.cdn_uri}
                        </div>
                      </div>
                    )}
                    {file.mime && (
                      <div>
                        <span className="text-sm text-green-500 mb-1 font-mono">
                          Type
                        </span>
                        <div className="font-mono  text-sm">{file.mime}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )

  useEffect(() => {
    console.log("walletAddress;", walletAddress)
    console.log(tokenInfo)
    if (walletAddress && tokenInfo) {
      if (walletAddress === tokenInfo.ownership.owner) {
        setIsNftOwner(true)
      }
    }
  }, [walletAddress, tokenInfo]);


  return (
    <div className="py-2 px-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-center w-full from-green-500/10">
        <div className="flex flex-col gap-6 md:flex-row h-full">
          <div className="md:w-1/3">
            <div className='block md:hidden my-4'>
              <h2 className="text-xl font-bold text-green-500">
                {tokenInfo.content.metadata.name}
              </h2>
              <div className="flex items-center gap-1">
                <p className="text-sm">{tokenInfo.id}</p>
                <CopyPaste content={tokenInfo.id} />
              </div>
            </div>
            {tokenInfo.content.links?.image ? (
              <>
                <Link href={tokenInfo.content.links.image} target="_blank">
                  <img
                    src={tokenInfo.content.links.image}
                    alt={tokenInfo.content.metadata.symbol}
                    className="rounded-lg md:min-w-[250px] lg:min-w-[300px] xl:min-w-[400px] 2xl:min-w-[450px]"
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
                </Link>
                <div className="border border-green-500 my-[20px] p-2 rounded-lg">
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
                <div>
                  <button
                    className={`w-full flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-2 ${(showNftSellLoading || showNftListLoading || !bestSellOffer) ? "cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={showNftSellLoading || showNftListLoading || !bestSellOffer}
                    onClick={handleNftSell}
                  >
                    {showNftSellLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      isNftOwner ? (
                        <span className="font-mono font-medium uppercase">
                          {
                            bestSellOffer ? "Accept Offer" : "No Offer for Sell"
                          }
                        </span>
                      ) : (
                        <span className="font-mono font-medium uppercase">Buy</span>
                      )
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="min-h-[200px] rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 flex items-center justify-center">
                <div className="font-mono text-sm">No image available</div>
              </div>
            )}
          </div>
          <div className="md:w-2/3">
            <div className='hidden md:block'>
              <h2 className="text-xl font-bold text-green-500">
                {tokenInfo.content.metadata.name}
              </h2>
              <div className="flex items-center gap-1">
                <p className="text-sm">{tokenInfo.id}</p>
                <CopyPaste content={tokenInfo.id} />
              </div>
            </div>
            <div className="border border-green-500 mt-5 p-2 rounded-lg">
              <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                Details
              </h3>
              <div className="flex flex-col gap-2 text-sm mt-2">
                <div className="flex justify-between items-center gap-1 uppercase">
                  <div>Owner</div>
                  <div className="flex gap-1">
                    <p className="text-green-500">
                      {tokenInfo.ownership.owner}
                    </p>
                    <CopyPaste content={tokenInfo.ownership.owner} />
                  </div>
                </div>
                <div className="flex justify-between items-center gap-1 uppercase">
                  <div>Mint Address</div>
                  <div className="flex gap-1">
                    <p className="text-green-500">
                      {tokenInfo.content.metadata.name}
                    </p>
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
                      <div className="flex gap-1" key={`authority-${i}`}>
                        <p className="text-green-500">{authority.address}</p>
                        <CopyPaste content={authority.address} />
                      </div>
                    )
                  )}
                </div>
                <div className="flex justify-between items-center gap-1 uppercase">
                  <div>COLLECTION ADDRESS</div>
                  <div className="flex gap-1">
                    <p className="text-green-500">
                      {tokenInfo.grouping?.find(
                        (g: { group_key: string; group_value: string }) =>
                          g.group_key === 'collection'
                      )?.group_value || 'None'}
                    </p>
                    <CopyPaste
                      content={
                        tokenInfo.grouping?.find(
                          (g: { group_key: string; group_value: string }) =>
                            g.group_key === 'collection'
                        )?.group_value || 'None'
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center gap-1 uppercase">
                  <div>TOKEN STANDARD</div>
                  <div className="flex gap-1">
                    <p className="text-green-500">{tokenInfo.interface}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-1 uppercase">
                  <div>ROYALTIES</div>
                  <div className="flex gap-1">
                    <p className="text-green-500">
                      {tokenInfo.royalty?.percent
                        ? tokenInfo.royalty.percent * 100
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-green-500 mt-5 p-2 rounded-lg">
              <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                TOKEN CREATORS
              </h3>
              <div className="text-sm mt-2">
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
                        <div
                          key={index}
                          className="w-full flex flex-row justify-between"
                        >
                          <div className="flex gap-1">
                            <p className="text-green-500">
                              {creator.address}
                            </p>
                            <CopyPaste content={creator.address} />
                          </div>
                          <span>{creator.share || 0}%</span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="w-full flex flex-row justify-between">
                      <div className="flex gap-1">
                        <p className="text-green-500">NONE</p>
                        <CopyPaste content="NONE" />
                      </div>
                      <span>0%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border border-green-500 mt-5 p-2 rounded-lg">
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
            {
              isNftOwner && <div className="border border-green-500 my-[20px] p-2 rounded-lg">
                <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                  List
                </h3>
                <div className='flex flex-col gap-1 my-2'>
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
                              e.target.setSelectionRange(
                                cursorPosition,
                                cursorPosition
                              )
                            }, 0)
                          }
                        }}
                        value={listAmount}
                      />
                    </div>
                  </div>
                  <button
                    className="w-full flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-1 cursor-pointer"
                    disabled={showNftListLoading}
                    onClick={handleNftList}
                  >
                    {showNftListLoading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span className="font-mono font-medium uppercase">
                          List
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-row gap-3 pt-[60px]">
        <p
          className={getTabStyle(NFTTab.Technical)}
          onClick={() => setActiveTab(NFTTab.Technical)}
        >
          Technical
        </p>
        <p
          className={getTabStyle(NFTTab.Transaction)}
          onClick={() => setActiveTab(NFTTab.Transaction)}
        >
          Transactions
        </p>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === NFTTab.Technical && renderTechnicalTab()}
        {activeTab === NFTTab.Transaction && (
          <TransactionSection walletAddress={tokenInfo.id} hasSearched={true} />
        )}
      </div>
    </div>
  )
}

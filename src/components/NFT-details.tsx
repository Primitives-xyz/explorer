'use client'

import { CopyPaste } from '@/components/common/copy-paste'
import { TransactionSection } from '@/components/transaction-section'
import type { NFTTokenInfo } from '@/types/Token'
import { DAS } from 'helius-sdk'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CollectionList {
  pdaAddress: string,
  auctionHouse: string,
  tokenAddress: string,
  tokenMint: string,
  seller: string,
  sellerReferral: string,
  tokenSize: number,
  price: number,
  priceInfo: {
    solPrice: {
      rawAmount: string,
      address: string,
      decimals: number
    }
  },
  rarity: any,
  extra: {
    img: string
  },
  expiry: number,
  token: {
    mintAddress: string,
    owner: string,
    supply: number,
    collection: string,
    collectionName: string,
    name: string,
    updateAuthority: string,
    primarySaleHappened: boolean,
    sellerFeeBasisPoints: number,
    image: string,
    attributes: Array<
      {
        trait_type: string,
        value: string
      }>
    properties: {
      files: Array<
        {
          uri: string
        }>
    },
    isCompressed: boolean,
    price: number,
    listStatus: string,
    tokenAddress: string,
    priceInfo: {
      solPrice: {
        rawAmount: string,
        address: string,
        decimals: number
      }
    }
  },
  listingSource: string
}

interface NFTDetailsProps {
  id: string
  tokenInfo: NFTTokenInfo
}

enum NFTTab {
  Transaction = "transaction",
  Technical = "technical",
  NftTrade = "nftTrade"
}

export default function NFTDetails({ id, tokenInfo }: NFTDetailsProps) {
  const [activeTab, setActiveTab] = useState<NFTTab>(NFTTab.Technical)
  const [collectionSymbol, setCollectionSymbol] = useState<string | null>(null)
  const [collectionLists, setCollectionLists] = useState<CollectionList[]>([])
  const [selectedNft, setSelectedNft] = useState<CollectionList | null>(null)
  const [selectedTokenModal, setSelectedTokenModal] = useState<boolean>(false)

  const getTabStyle = (tab: NFTTab) => {
    const isActive = activeTab === tab

    return `font-mono text-sm py-1 cursor-pointer uppercase ${isActive ? 'font-bold text-green-500 border-b border-b-green-500' : ''}`
  }

  const renderTechnicalTab = () => (
    <>
      <div className='border border-green-500 mt-5 p-2 rounded-lg'>
        <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
          schema & rpc
        </h3>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <div
            className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group"
          >
            <div className="text-sm text-green-500 mb-1 font-mono">
              schema
            </div>
            <div className="text-sm font-mono group-hover: transition-colors">
              {tokenInfo.content.$schema?.toString() || "NONE"}
            </div>
          </div>
          <div
            className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group"
          >
            <div className="text-sm text-green-500 mb-1 font-mono">
              json rpc
            </div>
            <div className="text-sm font-mono">
              {/* {tokenInfo.content.json_uri.slice(0, 34)}...${tokenInfo.content.json_uri.slice(-4)} */}
              {tokenInfo.content.json_uri?.toString() || "NONE"}
            </div>
          </div>
        </div>
      </div>
      <div className='border border-green-500 mt-5 p-2 rounded-lg'>
        <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
          compression details
        </h3>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {
            tokenInfo.compression &&
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
                    {tokenInfo.compression?.[key as keyof typeof tokenInfo.compression]?.toString() || "NONE"}
                  </div>
                </div>
              </>
            ))
          }
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
                      <span className="text-sm text-green-500 mb-1 font-mono">URI</span>
                      <div className="text-sm mb-1 font-mono">
                        {file.uri}
                      </div>
                    </div>
                    {file.cdn_uri && (
                      <div className="md:col-span-2">
                        <span className="text-sm text-green-500 mb-1 font-mono">CDN URI</span>
                        <div className="font-mono  break-all text-sm">
                          {file.cdn_uri}
                        </div>
                      </div>
                    )}
                    {file.mime && (
                      <div>
                        <span className="text-sm text-green-500 mb-1 font-mono">Type</span>
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

  const renderNftTradeTabe = () => (
    <div className='grid grid-flow-row gap-3 grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8'>
      {
        collectionLists.map((collectionList, index) => (
          <div
            className='bg-black/30 border border-green-800/40 rounded-lg flex flex-col gap-1 cursor-pointer hover:scale-105'
          >
            <div key={index}
              onClick={() => {
                setSelectedNft(collectionList)
                setSelectedTokenModal(true)
              }}>
              <div>
                <img
                  src={collectionList.extra.img}
                  alt={collectionList.token.name}
                  className='rounded-t-lg'
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
              </div>
              <div className='p-3 flex flex-col gap-2'>
                <p className='font-mono font-semibold text-xs text-green-500'>{collectionList.token.name}</p>
                <p className='font-mono font-semibold text-xs text-green-500'>{collectionList.price} SOL</p>
              </div>
            </div>
          </div>
        ))
      }
      {
        selectedTokenModal && <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        ><div className="relative max-w-4xl flex items-center justify-center w-full p-4 bg-black/90 border border-green-800 rounded-lg h-[520px] overflow-y-auto">
            <div className='w-[20px] h-[20px] absolute right-[10px] top-[10px] font-bold text-center leading-[100%] text-lg border border-green-800 rounded-sm cursor-pointer'
              onClick={() => { setSelectedTokenModal(false) }}
            >X</div>
            {selectedNft ? (
              <div className="flex flex-col gap-6 md:flex-row h-full">
                <div className="md:w-2/5">
                  <Link href={selectedNft.extra.img} target='_blank'>
                    <img
                      src={selectedNft.extra.img}
                      alt={selectedNft.token.name}
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
                  <div
                    className='flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-1 cursor-pointer'
                    onClick={() => { }}
                  >
                    <span className='font-mono font-medium uppercase'>BUY</span>
                  </div>
                </div>

                <div className="md:w-3/5">
                  <h2 className="text-xl font-bold text-green-500">{selectedNft.token.name}</h2>
                  <div className='border border-green-500 mt-5 p-2 rounded-lg'>
                    <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                      Details
                    </h3>
                    <div className='flex flex-col gap-2 text-sm mt-2'>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        <div>Price</div>
                        <div className='flex gap-1'>
                          <p className='text-green-500'>{selectedNft.price} SOL</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        <div>Mint Address</div>
                        <div className='flex gap-1'>
                          <p className='text-green-500'>{selectedNft.token.name}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        <div>Owner</div>
                        <div className='flex gap-1'>
                          <p className='text-green-500'>{selectedNft.token.owner}</p>
                          <CopyPaste content={selectedNft.token.owner} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        <div>COLLECTION ADDRESS</div>
                        <div className='flex gap-1'>
                          <p className='text-green-500'>{selectedNft.token.updateAuthority}</p>
                          <CopyPaste content={selectedNft.token.updateAuthority} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-1 uppercase">
                        <div>ROYALTIES</div>
                        <div className='flex gap-1'>
                          <p className='text-green-500'>
                            {selectedNft.token.sellerFeeBasisPoints}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='border border-green-500 mt-5 p-2 rounded-lg'>
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
                  <div className='h-[20px]'></div>
                </div>
              </div>
            ) : (
              <Loader2 className="h-10 w-10 animate-spin" />
            )}
          </div>
        </div>
      }
    </div>
  )

  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/tokens/${id}/collection`)
      const data = await response.json()
      setCollectionSymbol(data.collection)
    })()
  }, [id])

  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/tokens/${id}/collection/lists`)
      const data = await response.json()
      setCollectionLists(data.collectionLists)
    })()
  }, [collectionSymbol])

  return (
    <div className="py-2 px-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-center w-full from-green-500/10">
        {tokenInfo ? (
          <div className="flex flex-col gap-6 md:flex-row h-full">
            <div className="md:w-1/3">
              {tokenInfo.content.links?.image ? (
                <>
                  <Link href={tokenInfo.content.links.image} target='_blank'>
                    <img
                      src={tokenInfo.content.links.image}
                      alt={tokenInfo.content.metadata.symbol}
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
                  </div></>
              ) : (
                <div className="min-h-[200px] rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 flex items-center justify-center">
                  <div className="font-mono text-sm">No image available</div>
                </div>
              )
              }
            </div>
            <div className="md:w-2/3">
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
                      <p className='text-green-500'>{tokenInfo.ownership.owner}</p>
                      <CopyPaste content={tokenInfo.ownership.owner} />
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
                        {tokenInfo.interface}
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
          <Loader2 className="h-10 w-10 animate-spin" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-row gap-3">
        <p className={getTabStyle(NFTTab.Technical)} onClick={() => setActiveTab(NFTTab.Technical)}>
          Technical
        </p>
        <p className={getTabStyle(NFTTab.Transaction)} onClick={() => setActiveTab(NFTTab.Transaction)}>
          Transactions
        </p>
        <p className={getTabStyle(NFTTab.NftTrade)} onClick={() => setActiveTab(NFTTab.NftTrade)}>
          Trade
        </p>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === NFTTab.Technical && renderTechnicalTab()}
        {activeTab === NFTTab.Transaction && (
          <TransactionSection walletAddress={tokenInfo.id} hasSearched={true} />
        )}
        {activeTab === NFTTab.NftTrade && renderNftTradeTabe()}
      </div>
    </div>
  )
}

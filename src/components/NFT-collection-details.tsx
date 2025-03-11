'use client'

// React and Next.js imports
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// UI components and icons
import { Loader2 } from 'lucide-react';
import { CopyPaste } from '@/components/common/copy-paste';
import { useToast } from '@/hooks/use-toast';

// Solana-related imports
import { Connection, VersionedTransaction } from '@solana/web3.js';

// Local types and hooks
import type { NFTTokenInfo } from '@/types/Token';
import { useCurrentWallet } from './auth/hooks/use-current-wallet';

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

interface CollectionStat {
    floorPrice: number,
    listedCount: number,
    volume24hr: number
    txns24hr: number
    volumeAll: number,
    supply: number,
    holders: number
}

interface NftCollectionDetailProps {
    id: string,
    tokenInfo: NFTTokenInfo
}

export default function NFTCollectionDetail({ id, tokenInfo }: NftCollectionDetailProps) {
    // Context hooks
    const { toast } = useToast();
    const t = useTranslations();
    const { primaryWallet, walletAddress } = useCurrentWallet();

    // Collection-related state
    const [collectionSymbol, setCollectionSymbol] = useState<string | null>(null);
    const [nftCollectionStat, setNftCollectionStat] = useState<CollectionStat | null>(null);
    const [collectionLists, setCollectionLists] = useState<CollectionList[]>([]);

    // NFT selection state
    const [selectedNft, setSelectedNft] = useState<CollectionList | null>(null);
    const [selectedTokenModal, setSelectedTokenModal] = useState<boolean>(false);

    // Loading state
    const [showNftBuyLoading, setShowNftBuyLoading] = useState<boolean>(false);

    const handleNftBuy = async () => {
        try {
            if (!selectedNft) {
                toast({
                    title: "NFT Buy Error",
                    description: "Please select a NFT to purchase",
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

            const simulateTx = await connection.simulateTransaction(vtx, { replaceRecentBlockhash: true })
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

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/magiceden/collection/${id}`)
            const data = await response.json()
            setCollectionSymbol(data.collectionSymbol)
        })()
    }, [id])

    useEffect(() => {
        (async () => {
            if (collectionSymbol) {
                const collectionStatsRes = await fetch(`/api/magiceden/collection/${collectionSymbol}/stats`)
                const collectionStatsResData = await collectionStatsRes.json()
                setNftCollectionStat(collectionStatsResData)

                await new Promise((resolve) => { setTimeout(resolve, 1000) })

                const collectionListsRes = await fetch(`/api/magiceden/collection/${collectionSymbol}/lists`)
                const collectionListsResData = await collectionListsRes.json()
                console.log('collectionListsResData:', collectionListsResData)
                setCollectionLists(collectionListsResData.collectionLists)
            }
        })()
    }, [collectionSymbol])

    return (
        <div className="py-2 px-10 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-center w-full from-green-500/10">
                {tokenInfo ? (
                    <div className="flex flex-col gap-6 md:flex-row h-full">
                        <div className="md:w-1/3">
                            {tokenInfo.content.links?.image ? (
                                <Link href={tokenInfo.content.links.image} target='_blank'>
                                    <img
                                        src={tokenInfo.content.links.image}
                                        alt={tokenInfo.content.metadata.symbol}
                                        className="rounded-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.style.display = 'none'
                                            target.parentElement?.classList.add(
                                                'h-[200px]',
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
                            ) : (
                                <div className="min-h-[200px] rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 flex items-center justify-center">
                                    <div className="font-mono text-sm">No image available</div>
                                </div>
                            )
                            }
                        </div>
                        <div className="md:w-2/3">
                            <h2 className="text-xl font-bold text-green-500">{tokenInfo.content.metadata.name} | {tokenInfo.interface}</h2>

                            <div className="flex items-center gap-1">
                                <p className="text-sm">{tokenInfo.id}</p>
                                <CopyPaste content={tokenInfo.id} />
                            </div>

                            <div className='border border-green-500 my-1 p-2 rounded-lg'>
                                <h3 className="text-md font-mono font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                                    Description
                                </h3>
                                {tokenInfo && tokenInfo.content?.metadata?.description && (
                                    <div className="mt-2">
                                        <p className="font-mono font-semibold text-base text-gray-300 max-h-24 overflow-y-auto">
                                            {tokenInfo.content?.metadata.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className='border border-green-500 mt-5 p-2 rounded-lg'>
                                <h3 className="text-md font-bold text-green-500 border-b-2 border-green-500/30 uppercase">
                                    Collection Stats
                                </h3>
                                {
                                    nftCollectionStat ? (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">Floor Price</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {nftCollectionStat?.floorPrice}
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">24H Volume</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {nftCollectionStat?.volume24hr}
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">24H SALES</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {nftCollectionStat?.txns24hr}
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">all volume</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {nftCollectionStat?.volumeAll}
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">Listed</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {nftCollectionStat?.listedCount}
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">royalties</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {tokenInfo.royalty?.percent ? tokenInfo.royalty.percent * 100 : 0}%
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">holders</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {nftCollectionStat?.holders}
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group">
                                                <div className="text-sm text-green-500 mb-1 font-mono uppercase">supply</div>
                                                <div className="text-sm font-mono group-hover: transition-colors">
                                                    {nftCollectionStat?.supply}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex flex-col justify-center items-center h-[178px]'>
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                ) : (
                    <Loader2 className="h-10 w-10 animate-spin" />
                )}
            </div>

            <div className="flex flex-row gap-3 mt-[50px]">
                <p className='font-mono text-sm py-1 cursor-pointer uppercase font-bold text-green-500 border-b border-b-green-500'>
                    NFTS
                </p>
            </div>

            <div className="mt-6 border border-green-500 rounded-lg p-2">
                {
                    collectionLists.length ? (
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
                                                    className='rounded-t-lg h-[160px]'
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.style.display = 'none'
                                                        target.parentElement?.classList.add(
                                                            'h-[160px]',
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
                                selectedTokenModal &&
                                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                                    <div className="relative max-w-4xl flex items-center justify-center w-full p-4 bg-black/90 border border-green-800 rounded-lg h-[520px] overflow-y-auto">
                                        <div
                                            className='w-[20px] h-[20px] absolute right-[10px] top-[10px] font-bold text-center leading-[100%] text-lg border border-green-800 rounded-sm cursor-pointer'
                                            onClick={() => { setSelectedTokenModal(false) }}
                                        >
                                            X
                                        </div>
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
                                                    <button
                                                        className='w-full flex justify-center items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg my-1 cursor-pointer'
                                                        disabled={showNftBuyLoading}
                                                        onClick={handleNftBuy}
                                                    >
                                                        {
                                                            showNftBuyLoading ? (
                                                                <>
                                                                    <Loader2 className="h-8 w-8 animate-spin" />
                                                                </>
                                                            ) : (
                                                                <><span className='font-mono font-medium uppercase'>Buy</span></>
                                                            )
                                                        }
                                                    </button>
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
                    ) : (
                        <div className='flex h-full items-center justify-center'>
                            <Loader2 className="h-10 w-10 animate-spin" />
                        </div>
                    )
                }
            </div>
        </div>
    )
}
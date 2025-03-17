'use client'

import { useFollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/hooks/use-following-transactions'
import { useTransactionType } from '@/components-new-version/home/home-content/following-transactions/hooks/use-transaction-type'
import { Transaction } from '@/components-new-version/models/helius/helius.models'
import { useGetFollowing } from '@/components-new-version/tapestry/hooks/use-get-following'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components-new-version/ui'
import { route } from '@/components-new-version/utils/route'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useToast } from '@/hooks/use-toast'
import { ClipboardIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export enum TransactionType {
  ALL = 'all',
  SWAP = 'swap',
  TRANSFER = 'transfer',
  COMPRESSED_NFT_MINT = 'compressed_nft_mint',
}

export function FollowingTransactions() {
  const { mainUsername } = useCurrentWallet()
  const { following } = useGetFollowing(mainUsername)

  const {
    aggregatedTransactions,
    isLoadingTransactions,
    totalWallets,
    selectedType,
    setSelectedType,
  } = useFollowingTransactions({ following })

  console.log(selectedType)

  return (
    <>
      <Tabs defaultValue={TransactionType.ALL}>
        <div className="px-5">
          <TabsList className="w-full">
            <TabsTrigger
              value={TransactionType.ALL}
              onChange={() => setSelectedType(TransactionType.ALL)}
              className="w-full"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value={TransactionType.SWAP}
              onChange={() => setSelectedType(TransactionType.SWAP)}
              className="w-full"
            >
              Swap
            </TabsTrigger>
            <TabsTrigger value={TransactionType.TRANSFER} className="w-full">
              Transfers
            </TabsTrigger>
            <TabsTrigger
              value={TransactionType.COMPRESSED_NFT_MINT}
              className="w-full"
            >
              CNFT Mints
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {aggregatedTransactions.map((transaction, index) => (
        <TransactionEntry key={index} transaction={transaction} />
      ))}
    </>
  )
}

function TransactionEntry({ transaction }: { transaction: Transaction }) {
  const {
    isComment,
    isSwap,
    isSolanaTransfer,
    isSPLTransfer,
    isNFTTransaction,
  } = useTransactionType(transaction)

  const primaryType = useMemo(() => {
    if (isComment) return 'COMMENT'
    if (isSwap) return 'SWAP'
    if (isSolanaTransfer) return 'SOL TRANSFER'
    if (isSPLTransfer) return 'SPL TRANSFER'
    if (isNFTTransaction) return 'NFT'
    return 'OTHER'
  }, [isComment, isSwap, isSolanaTransfer, isSPLTransfer, isNFTTransaction])

  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.signature)
    toast({
      title: 'Signature copied to clipboard',
      description: 'You can now paste it into the explorer',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div>
            <Link href={route('address', { id: transaction.signature })}>
              <span className="font-mono text-xs sm:text-sm font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-800/30 hover:border-green-700/40 transition-colors">
                {transaction.signature.slice(0, 4)}...
                {transaction.signature.slice(-4)}
              </span>
            </Link>
            <button
              onClick={handleCopy}
              className="p-1 rounded bg-green-900/20 border border-green-800/30 hover:border-green-700/40 transition-colors"
              title="Copy signature"
            >
              <ClipboardIcon className="w-4 h-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="max-h-[300px] overflow-auto py-4">
        <div className="flex items-center justify-between space-y-4">
          <span className="px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded">
            {primaryType}
          </span>
          {transaction.fee && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-900/20 rounded border border-green-800/30">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{Number(transaction.fee)} SOL</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

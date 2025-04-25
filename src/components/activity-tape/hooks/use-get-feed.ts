import { useQuery } from '@/utils/api'
import { useMemo } from 'react'
import { IActivityTapeEntry, IGetFeedResponse } from '../activity-tape.models'

const BASE_TIME = Math.floor(Date.now()) // Unix timestamp in seconds

const FAKE_ACTIVITIES: IActivityTapeEntry[] = [
  {
    type: 'FOLLOW',
    text: 'DeGods.sol followed BeansDAO.sol',
    action: '👥',
    wallet: 'DeGods.sol',
    timestamp: BASE_TIME - 120, // 2 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'TRANSFER',
    text: 'Whale transferred 50,000 USDC to Jito.sol',
    action: '💸',
    wallet: 'Bpf...2Eq',
    timestamp: BASE_TIME - 300, // 5 minutes ago
    highlight: 'positive',
    amount: '+50,000',
    amountSuffix: 'USDC',
  },
  {
    type: 'NFT_SALE',
    text: 'Mad Lads #1337 sold for 45 SOL',
    action: '🎨',
    wallet: 'Mad...Labs',
    timestamp: BASE_TIME - 480, // 8 minutes ago
    highlight: 'neutral',
    amount: '45 SOL',
  },
  {
    type: 'STAKE',
    text: 'Large stake delegation to Jito',
    action: '🔒',
    wallet: '7nZ...3tGy',
    timestamp: BASE_TIME - 600, // 10 minutes ago
    highlight: 'positive',
    amount: '+1000 SOL',
  },
  {
    type: 'SOCIAL',
    text: 'xNFT.sol reached 1000 followers',
    action: '🎯',
    wallet: 'xNFT.sol',
    timestamp: BASE_TIME - 900, // 15 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'SWAP',
    text: 'Large BONK/SOL swap on Jupiter',
    action: '💱',
    wallet: '4m4...enSj',
    timestamp: BASE_TIME - 1200, // 20 minutes ago
    highlight: 'negative',
    amount: '-2.5M BONK',
  },
  {
    type: 'LIQUIDATION',
    text: 'Position liquidated on Drift',
    action: '⚠️',
    wallet: 'Drft...X2z',
    timestamp: BASE_TIME - 1500, // 25 minutes ago
    highlight: 'negative',
    amount: '-100K USDC',
  },
]

export function useGetFeed() {
  const { data } = useQuery<IGetFeedResponse>({
    endpoint: 'feed',
  })

  const transactions: IActivityTapeEntry[] = useMemo(() => {
    return (
      data?.transactions?.map((entry) => ({
        type: entry.type,
        text: `${
          entry.username ||
          (entry.walletAddress
            ? entry.walletAddress.slice(0, 4) +
              '...' +
              entry.walletAddress.slice(-4)
            : '')
        } bought`,
        action: '💱',
        wallet: entry.username || entry.walletAddress,
        timestamp: Math.floor(new Date(entry.timestamp).getTime()),
        highlight: 'positive',
        amount: `${entry.to.amount.toFixed(2)}`,
        amountSuffix: 'SSE',
        isSSEBuy: true,
        signature: entry.signature,
      })) ?? []
    )
  }, [data])

  return {
    transactions: [...transactions, ...FAKE_ACTIVITIES],
  }
}

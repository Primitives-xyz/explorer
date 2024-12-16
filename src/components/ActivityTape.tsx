'use client'

const FAKE_ACTIVITIES = [
  {
    type: 'FOLLOW',
    text: 'DeGods.sol followed BeansDAO.sol',
    action: '👥',
    wallet: 'DeGods.sol',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'TRANSFER',
    text: 'Whale transferred 50,000 USDC to Jito.sol',
    action: '💸',
    wallet: 'Bpf...2Eq',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    highlight: 'positive',
    amount: '+50,000',
  },
  {
    type: 'NFT_SALE',
    text: 'Mad Lads #1337 sold for 45 SOL',
    action: '🎨',
    wallet: 'Mad...Labs',
    timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    highlight: 'neutral',
    amount: '45 SOL',
  },
  {
    type: 'STAKE',
    text: 'Large stake delegation to Jito',
    action: '🔒',
    wallet: '7nZ...3tGy',
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    highlight: 'positive',
    amount: '+1000 SOL',
  },
  {
    type: 'SOCIAL',
    text: 'xNFT.sol reached 1000 followers',
    action: '🎯',
    wallet: 'xNFT.sol',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'SWAP',
    text: 'Large BONK/SOL swap on Jupiter',
    action: '💱',
    wallet: '4m4...enSj',
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    highlight: 'negative',
    amount: '-2.5M BONK',
  },
  {
    type: 'LIQUIDATION',
    text: 'Position liquidated on Drift',
    action: '⚠️',
    wallet: 'Drft...X2z',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    highlight: 'negative',
    amount: '-100K USDC',
  },
]

export const ActivityTape = () => {
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  const getHighlightColor = (highlight: string) => {
    switch (highlight) {
      case 'positive':
        return 'text-green-400'
      case 'negative':
        return 'text-red-400'
      default:
        return 'text-green-300'
    }
  }

  return (
    <div className="border-b border-green-800 bg-black/50 overflow-hidden group">
      <div className="p-1.5 flex items-center gap-2 font-mono">
        <div className="flex-none text-green-600 text-xs">
          {'>'} network_feed.log
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="animate-scroll group-hover:pause inline-flex gap-8 text-xs">
            {[...FAKE_ACTIVITIES, ...FAKE_ACTIVITIES].map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                  {activity.action}
                </span>
                <span className={getHighlightColor(activity.highlight)}>
                  {activity.text}
                </span>
                {activity.amount && (
                  <span
                    className={`${getHighlightColor(activity.highlight)} font-bold`}
                  >
                    {activity.amount}
                  </span>
                )}
                <span className="text-green-600">({activity.wallet})</span>
                <span className="text-green-500 text-opacity-60">
                  {formatTimeAgo(activity.timestamp)}
                </span>
                <span className="text-green-800">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

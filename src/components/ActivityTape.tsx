'use client'

const FAKE_ACTIVITIES = [
  {
    type: 'FOLLOW',
    text: 'DeGods.sol followed BeansDAO.sol',
    action: '👥',
    wallet: 'DeGods.sol',
  },
  {
    type: 'TRANSFER',
    text: 'Whale transferred 50,000 USDC to Jito.sol',
    action: '💸',
    wallet: 'Bpf...2Eq',
  },
  {
    type: 'PORTFOLIO',
    text: 'Famous wallet tracking enabled',
    action: '📊',
    wallet: '7nZ...3tGy',
  },
  {
    type: 'SOCIAL',
    text: 'xNFT.sol reached 1000 followers',
    action: '🎯',
    wallet: 'xNFT.sol',
  },
  {
    type: 'WHALE',
    text: 'Whale wallet added to watchlist',
    action: '🐋',
    wallet: '4m4...enSj',
  },
  {
    type: 'UPDATE',
    text: 'Mad Lads updated their profile',
    action: '📝',
    wallet: 'Mad...Labs',
  },
]

export const ActivityTape = () => {
  return (
    <div className="border-b border-green-800 bg-black/50 overflow-hidden group">
      <div className="p-1.5 flex items-center gap-2 font-mono">
        <div className="flex-none text-green-600 text-xs">
          {'>'} network_feed.log
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="animate-scroll group-hover:pause inline-flex gap-8 text-xs">
            {[...FAKE_ACTIVITIES, ...FAKE_ACTIVITIES].map((activity, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                  {activity.action}
                </span>
                <span className="text-green-300">{activity.text}</span>
                <span className="text-green-600">({activity.wallet})</span>
                <span className="text-green-800">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

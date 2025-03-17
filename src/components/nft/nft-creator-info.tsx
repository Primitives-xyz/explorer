import { TokenAddress } from '@/components/tokens/token-address'
import { NFT } from '@/utils/types'
import { motion } from 'framer-motion'

interface NFTCreatorInfoProps {
  nft: NFT
}

export function NFTCreatorInfo({ nft }: NFTCreatorInfoProps) {
  const hasCreator =
    nft.creators &&
    nft.creators.length > 0 &&
    typeof nft.creators[0] === 'string'

  const creatorAddress = hasCreator ? nft.creators[0] : ''

  return (
    <motion.div
      className="flex items-center gap-1.5 text-xs"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg
          className="w-2 h-2 text-green-400"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {hasCreator ? (
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="text-green-400/70">by</span>
          <TokenAddress address={creatorAddress} />
        </div>
      ) : (
        <span className="text-green-400/50 italic">Unknown creator</span>
      )}
    </motion.div>
  )
}

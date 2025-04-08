import { Badge } from '@/components/ui/badge'
import { NFT } from '@/utils/types'
import { motion } from 'framer-motion'

interface NFTBadgesProps {
  nft: NFT
  viewMode: 'grid' | 'list'
}

export function NFTBadges({ nft, viewMode }: NFTBadgesProps) {
  const badgeVariants = {
    initial: { opacity: 0, scale: 0.8, y: -5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    hover: { y: -2, scale: 1.05 },
  }

  // Count how many badges we'll display
  const badgeCount = [
    nft.compressed,
    nft.mutable,
    nft.interface === 'ProgrammableNFT',
  ].filter(Boolean).length

  // If no badges, don't render anything
  if (badgeCount === 0) return null

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 z-30">
      {/* If we have multiple badges, show a combined badge for grid view */}
      {viewMode === 'grid' && badgeCount > 1 ? (
        <motion.div
          initial="initial"
          animate="animate"
          whileHover="hover"
          variants={badgeVariants}
          transition={{ duration: 0.2 }}
        >
          <Badge
            className="bg-linear-to-r from-purple-500/90 to-indigo-500/90 text-white backdrop-blur-xs 
            text-xs font-medium shadow-sm shadow-purple-500/20 border border-purple-400/20 px-1.5"
          >
            <span className="mr-1">{badgeCount}</span>
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Badge>
        </motion.div>
      ) : (
        <>
          {nft.compressed && (
            <motion.div
              initial="initial"
              animate="animate"
              whileHover="hover"
              variants={badgeVariants}
              transition={{ duration: 0.2 }}
            >
              <Badge
                className={`bg-linear-to-r from-green-500/90 to-emerald-500/90 text-black backdrop-blur-xs ${
                  viewMode === 'list' ? 'text-xs' : 'text-xs'
                } font-medium shadow-sm shadow-green-500/20 border border-green-400/20 ${
                  viewMode === 'grid' ? 'px-1.5 py-0' : ''
                }`}
              >
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.5 7.27783L12 12.0001M12 12.0001L3.5 7.27783M12 12.0001L12 21.5001"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.5 16.7223L12 21.5001L3.5 16.7223"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.5 12.0001L12 16.7223L3.5 12.0001"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2.5L20.5 7.27783L12 12.0001L3.5 7.27783L12 2.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {viewMode === 'list' ? 'Compressed' : 'C'}
              </Badge>
            </motion.div>
          )}

          {nft.mutable && (
            <motion.div
              initial="initial"
              animate="animate"
              whileHover="hover"
              variants={badgeVariants}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Badge
                className={`bg-linear-to-r from-amber-400/90 to-yellow-500/90 text-black backdrop-blur-xs ${
                  viewMode === 'list' ? 'text-xs' : 'text-xs'
                } font-medium shadow-sm shadow-yellow-500/20 border border-yellow-400/20 ${
                  viewMode === 'grid' ? 'px-1.5 py-0' : ''
                }`}
              >
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.2322 5.23223L18.7677 8.76777M16.7322 3.73223C17.7085 2.75592 19.2914 2.75592 20.2677 3.73223C21.244 4.70854 21.244 6.29146 20.2677 7.26777L6.5 21.0355H3V17.4644L16.7322 3.73223Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {viewMode === 'list' ? 'Mutable' : 'M'}
              </Badge>
            </motion.div>
          )}

          {nft.interface === 'ProgrammableNFT' && (
            <motion.div
              initial="initial"
              animate="animate"
              whileHover="hover"
              variants={badgeVariants}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Badge
                className={`bg-linear-to-r from-blue-500/90 to-indigo-500/90 text-white backdrop-blur-xs ${
                  viewMode === 'list' ? 'text-xs' : 'text-xs'
                } font-medium shadow-sm shadow-blue-500/20 border border-blue-400/20 ${
                  viewMode === 'grid' ? 'px-1.5 py-0' : ''
                }`}
              >
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 12.5C14 13.8807 12.8807 15 11.5 15C10.1193 15 9 13.8807 9 12.5C9 11.1193 10.1193 10 11.5 10C12.8807 10 14 11.1193 14 12.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.3675 19.4151C16.0053 20.4151 14.3086 21 12.5 21C9.6875 21 7.15 19.6667 5.5 17.5C3.85 15.3333 3 12.6667 3 9.5C3 7.9 3.3 6.4 3.9 5C4.5 3.6 5.375 2.5 6.525 1.7C7.675 0.9 9 0.5 10.5 0.5C12 0.5 13.3333 0.833333 14.5 1.5C15.6667 2.16667 16.5833 3.08333 17.25 4.25C17.9167 5.41667 18.25 6.75 18.25 8.25C18.25 9.08333 18.0833 9.83333 17.75 10.5C17.4167 11.1667 16.9167 11.6667 16.25 12C15.5833 12.3333 14.8333 12.5 14 12.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {viewMode === 'list' ? 'pNFT' : 'P'}
              </Badge>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

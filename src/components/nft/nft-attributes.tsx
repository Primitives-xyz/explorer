import { NFT } from '@/utils/types'
import { motion } from 'framer-motion'

interface NFTAttributesProps {
  nft: NFT
  viewMode: 'grid' | 'list'
}

export function NFTAttributes({ nft, viewMode }: NFTAttributesProps) {
  const attributes = nft.metadata.attributes || []
  const displayAttributes = attributes.slice(0, viewMode === 'grid' ? 3 : 6)

  if (displayAttributes.length === 0) {
    return null
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
  }

  if (viewMode === 'grid') {
    return (
      <motion.div
        className="flex flex-wrap gap-1 mt-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {displayAttributes.map((attr, idx) => (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ scale: 1.05, y: -1 }}
            className="group"
          >
            <div className="text-[10px] px-1.5 py-0.5 bg-linear-to-r from-green-900/30 to-green-800/20 text-green-400 rounded-full border border-green-800/30 flex items-center gap-0.5 transition-all duration-200 group-hover:border-green-700/40 group-hover:from-green-900/40 group-hover:to-green-800/30">
              <span className="font-medium text-green-300/90 truncate max-w-[40px]">
                {attr.trait_type}
              </span>
              <span className="text-green-400/90 truncate max-w-[40px]">
                {attr.value}
              </span>
            </div>
          </motion.div>
        ))}
        {attributes.length > 3 && (
          <motion.div
            variants={item}
            whileHover={{ scale: 1.05, y: -1 }}
            className="group"
          >
            <div className="text-[10px] px-1.5 py-0.5 bg-linear-to-r from-blue-900/30 to-blue-800/20 text-blue-400 rounded-full border border-blue-800/30 flex items-center transition-all duration-200 group-hover:border-blue-700/40 group-hover:from-blue-900/40 group-hover:to-blue-800/30">
              <span className="text-blue-400/90">+{attributes.length - 3}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-2 gap-2 mt-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {displayAttributes.map((attr, idx) => (
        <motion.div
          key={idx}
          variants={item}
          whileHover={{ scale: 1.02 }}
          className="group"
        >
          <div className="p-2 bg-linear-to-r from-green-900/30 to-green-800/20 rounded-md border border-green-800/30 transition-all duration-200 group-hover:border-green-700/40 group-hover:from-green-900/40 group-hover:to-green-800/30">
            <div className="text-xs text-green-300 font-medium mb-0.5">
              {attr.trait_type}
            </div>
            <div className="text-sm text-green-100 font-semibold truncate">
              {attr.value}
            </div>
            {attr.frequency && (
              <div className="text-xs text-green-400/60 mt-1">
                {(attr.frequency * 100).toFixed(1)}% have this
              </div>
            )}
          </div>
        </motion.div>
      ))}
      {attributes.length > 6 && (
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02 }}
          className="group col-span-2"
        >
          <div className="p-2 bg-linear-to-r from-blue-900/30 to-blue-800/20 rounded-md border border-blue-800/30 flex items-center justify-center transition-all duration-200 group-hover:border-blue-700/40 group-hover:from-blue-900/40 group-hover:to-blue-800/30">
            <span className="text-blue-400/90 font-medium">
              +{attributes.length - 6} more attributes
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

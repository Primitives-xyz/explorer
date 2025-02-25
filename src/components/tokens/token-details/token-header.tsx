import { PeopleInCommonSection } from '@/components/social/people-in-common/PeopleInCommonSection'
import {
  DocumentDuplicateIcon,
  GlobeAltIcon,
  ArrowUpRightIcon as TwitterIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'

// Define the people in common data type
interface PeopleInCommonData {
  topUsers: Array<{ username: string; image: string }>
  totalAmount: number
  isLoading: boolean
}

interface TokenHeaderProps {
  id: string
  name: string
  symbol: string
  imageUrl: string
  website?: string
  twitter?: string
  peopleInCommon?: PeopleInCommonData
}

export function TokenHeader({
  id,
  name,
  symbol,
  imageUrl,
  website,
  twitter,
  peopleInCommon,
}: TokenHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Token Image */}
      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-green-800/40 shadow-lg flex-shrink-0">
        <Image
          src={imageUrl || '/fallback-token.png'}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Token Info */}
      <div className="flex-1 min-w-0">
        {/* Token Name and Symbol */}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg md:text-2xl font-bold font-mono truncate max-w-[200px] md:max-w-[400px]">
            {name}
          </h1>
          <span className="px-2 py-0.5 text-xs bg-green-900/30 border border-green-800/40 rounded-md font-mono">
            ${symbol}
          </span>
        </div>

        {/* Token ID and External Links */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 font-mono truncate">
              {id.slice(0, 8)}...{id.slice(-4)}
            </span>
            <button
              className="text-gray-400 hover:text-green-400 transition-colors"
              onClick={() => navigator.clipboard.writeText(id)}
            >
              <DocumentDuplicateIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
            </a>
          )}
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
            >
              <TwitterIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Twitter</span>
            </a>
          )}
        </div>

        {/* People in Common Section */}
        {peopleInCommon && peopleInCommon.topUsers.length > 0 && (
          <div className="mt-2">
            <PeopleInCommonSection
              topUsers={peopleInCommon.topUsers}
              totalAmount={peopleInCommon.totalAmount}
              tokenName={name}
            />
          </div>
        )}
      </div>
    </div>
  )
}

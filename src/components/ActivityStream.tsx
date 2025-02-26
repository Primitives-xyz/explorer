'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  MessageSquare,
  Send,
  Terminal,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type Activity = {
  id: string
  type: 'trade' | 'mint' | 'transfer' | 'follow' | 'comment'
  user: string
  details: string
  timestamp: string
}

export default function ActivityStream({ username }: { username: string }) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Fetch activities here
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'trade',
        user: username,
        details: 'Swapped 10 ETH for 5000 USDC',
        timestamp: '2 minutes ago',
      },
      {
        id: '2',
        type: 'mint',
        user: 'CryptoArtist',
        details: 'Minted a new NFT "Cosmic Dreams #42"',
        timestamp: '1 hour ago',
      },
      {
        id: '3',
        type: 'follow',
        user: username,
        details: 'Started following TokenMaster',
        timestamp: '3 hours ago',
      },
      {
        id: '4',
        type: 'transfer',
        user: 'DeFiWhale',
        details: 'Transferred 100,000 USDC to a vault',
        timestamp: '5 hours ago',
      },
      {
        id: '5',
        type: 'comment',
        user: username,
        details: 'Commented on NFT "Bored Ape #1234"',
        timestamp: '1 day ago',
      },
    ]
    setActivities(mockActivities)
  }, [username])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <ArrowRight className="h-3 w-3" />
      case 'mint':
        return <Zap className="h-3 w-3" />
      case 'transfer':
        return <Send className="h-3 w-3" />
      case 'follow':
        return <UserPlus className="h-3 w-3" />
      case 'comment':
        return <MessageSquare className="h-3 w-3" />
      default:
        return <Terminal className="h-3 w-3" />
    }
  }

  return (
    <div className="container mx-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-sm">
        <div className="border-b border-gray-700 px-4 py-3 flex items-center">
          <Terminal className="h-4 w-4 text-green-500 mr-2" />
          <h2 className="text-sm font-mono font-bold text-green-400">
            Activity Log
          </h2>
        </div>

        <div className="divide-y divide-gray-800">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="px-4 py-3 hover:bg-gray-800/50"
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 border border-gray-700">
                  <AvatarImage
                    src={`/placeholder.svg?height=40&width=40`}
                    alt={activity.user}
                  />
                  <AvatarFallback className="bg-gray-800 text-green-500 text-xs">
                    {activity.user.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-grow">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono text-sm text-green-300">
                      @{activity.user}
                    </span>
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 h-5 text-xs font-mono border-gray-700 flex items-center gap-1"
                    >
                      {getActivityIcon(activity.type)}
                      <span className="text-gray-400">{activity.type}</span>
                    </Badge>
                    <span className="text-xs text-gray-500 ml-auto font-mono">
                      {activity.timestamp}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mt-1 font-mono">
                    <span className="text-gray-500">$ </span>
                    {activity.details}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 font-mono text-sm">No activity found</p>
          </div>
        )}
      </div>
    </div>
  )
}

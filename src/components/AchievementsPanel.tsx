"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Zap } from "lucide-react"

type Achievement = {
  id: string
  name: string
  description: string
  progress: number
  maxProgress: number
  icon: "trophy" | "target" | "zap"
}

export default function AchievementsPanel({ username }: { username: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    // Fetch achievements here
    const mockAchievements: Achievement[] = [
      {
        id: "1",
        name: "Crypto Millionaire",
        description: "Reach $1,000,000 in portfolio value",
        progress: 750000,
        maxProgress: 1000000,
        icon: "trophy",
      },
      {
        id: "2",
        name: "NFT Collector",
        description: "Collect 100 unique NFTs",
        progress: 42,
        maxProgress: 100,
        icon: "target",
      },
      {
        id: "3",
        name: "Trading Pro",
        description: "Complete 1000 trades",
        progress: 753,
        maxProgress: 1000,
        icon: "zap",
      },
    ]
    setAchievements(mockAchievements)
  }, [])

  const getIcon = (icon: Achievement["icon"]) => {
    switch (icon) {
      case "trophy":
        return <Trophy className="w-6 h-6" />
      case "target":
        return <Target className="w-6 h-6" />
      case "zap":
        return <Zap className="w-6 h-6" />
    }
  }

  return (
    <Card className="bg-gray-800 text-white">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Achievements</h2>
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Badge className="p-2 bg-primary">{getIcon(achievement.icon)}</Badge>
                <div className="flex-grow">
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{achievement.progress}</span>
                  <span className="text-gray-400">/{achievement.maxProgress}</span>
                </div>
              </div>
              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="mt-2" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


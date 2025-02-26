"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

type Token = {
  symbol: string
  name: string
  balance: string
  value: number
  change24h: number
}

export default function TokenDashboard({ walletAddress }: { walletAddress: string }) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    // Fetch tokens here
    const mockTokens: Token[] = [
      { symbol: "ETH", name: "Ethereum", balance: "10.5", value: 18900, change24h: 2.5 },
      { symbol: "USDC", name: "USD Coin", balance: "5000", value: 5000, change24h: 0.1 },
      { symbol: "LINK", name: "Chainlink", balance: "1000", value: 7000, change24h: -1.2 },
      { symbol: "UNI", name: "Uniswap", balance: "500", value: 3000, change24h: 5.7 },
    ]
    setTokens(mockTokens)
    setTotalValue(mockTokens.reduce((acc, token) => acc + token.value, 0))
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <Card className="bg-gray-800 text-white">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Token Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Holdings</h3>
            <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
            <div className="mt-4 space-y-2">
              {tokens.map((token, index) => (
                <motion.div
                  key={token.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold">{token.symbol}</span>
                    <span className="text-gray-400 ml-2">{token.name}</span>
                  </div>
                  <div className="text-right">
                    <div>${token.value.toLocaleString()}</div>
                    <div className="text-sm">
                      {token.balance} {token.symbol}
                      <Badge className={`ml-2 ${token.change24h >= 0 ? "bg-green-500" : "bg-red-500"}`}>
                        {token.change24h >= 0 ? (
                          <ArrowUp className="w-3 h-3 inline mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 inline mr-1" />
                        )}
                        {Math.abs(token.change24h)}%
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Portfolio Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokens}
                  dataKey="value"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {tokens.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


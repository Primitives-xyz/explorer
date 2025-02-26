"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

type Transaction = {
  id: string
  type: "send" | "receive"
  amount: string
  token: string
  from: string
  to: string
  timestamp: string
}

export default function TransactionHistory({ walletAddress }: { walletAddress: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Fetch transactions here
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        type: "send",
        amount: "5",
        token: "ETH",
        from: walletAddress,
        to: "0x1234...5678",
        timestamp: "2023-06-01 14:30:00",
      },
      {
        id: "2",
        type: "receive",
        amount: "1000",
        token: "USDC",
        from: "0x9876...5432",
        to: walletAddress,
        timestamp: "2023-05-30 09:15:00",
      },
      {
        id: "3",
        type: "send",
        amount: "50",
        token: "LINK",
        from: walletAddress,
        to: "0x2468...1357",
        timestamp: "2023-05-28 18:45:00",
      },
      {
        id: "4",
        type: "receive",
        amount: "0.5",
        token: "ETH",
        from: "0x1357...2468",
        to: walletAddress,
        timestamp: "2023-05-25 11:00:00",
      },
    ]
    setTransactions(mockTransactions)
  }, [walletAddress])

  return (
    <Card className="bg-gray-800 text-white">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Badge className={tx.type === "send" ? "bg-red-500" : "bg-green-500"}>
                  {tx.type === "send" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </Badge>
                <div>
                  <div className="font-semibold">
                    {tx.type === "send" ? "Sent" : "Received"} {tx.amount} {tx.token}
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.type === "send" ? "To: " : "From: "}
                    {tx.type === "send" ? tx.to : tx.from}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div>{new Date(tx.timestamp).toLocaleDateString()}</div>
                <div className="text-sm text-gray-400">{new Date(tx.timestamp).toLocaleTimeString()}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { ExternalLink } from "lucide-react"
// import { Button } from "@/components/ui/button"

// interface TokenData {
//   name: string
//   id: string
//   prices: { timestamp: number; price: number }[]
//   percentChange: number
//   usdValue: number
// }

// export default function TokenPriceChart() {
//   const [expanded, setExpanded] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [tokenData, setTokenData] = useState<TokenData[]>([
//     { name: "SOL", id: SOLANA_TOKENS.SOL, prices: [], percentChange: 0, usdValue: 0 },
//     { name: "BONK", id: SOLANA_TOKENS.BONK, prices: [], percentChange: 0, usdValue: 0 },
//   ])

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setLoading(true)
//         const updatedTokenData = await Promise.all(
//           tokenData.map(async (token) => {
//             const tokenPriceHistoryRes = await fetch(
//               `/api/tokens/coingecko?tokenId=${token.id}`
//             )
//             const data = await tokenPriceHistoryRes.json()
//             return {
//               ...token,
//               prices: data.prices,
//               percentChange: data.percentChange,
//               usdValue: data.prices[data.prices.length - 1]?.price || 0,
//             }
//           }),
//         )
//         setTokenData(updatedTokenData)
//       } catch (error) {
//         console.error("Error fetching token data:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//     // Set up a refresh interval (e.g., every 5 minutes)
//     const intervalId = setInterval(() => fetchData(), 5 * 60 * 1000)

//     return () => clearInterval(intervalId)
//   }, [])

//   // Function to generate SVG path for the chart
//   const generatePath = (data: { timestamp: number; price: number }[]) => {
//     if (data.length === 0) return ""

//     const prices = data.map((item) => item.price)
//     const max = Math.max(...prices)
//     const min = Math.min(...prices)
//     const range = max - min || 1 // Prevent division by zero

//     // Scale the data to fit in the SVG
//     const scaledData = prices.map((value) => 40 - ((value - min) / range) * 30)

//     // Create the SVG path
//     return scaledData.reduce((path, point, index) => {
//       const x = (index / (scaledData.length - 1)) * 100
//       return path + (index === 0 ? `M${x},${point}` : ` L${x},${point}`)
//     }, "")
//   }

//   // Format USD value with appropriate precision
//   const formatUsdValue = (value: number) => {
//     if (value >= 1) return `$${value.toFixed(2)}`
//     if (value >= 0.01) return `$${value.toFixed(4)}`
//     return `$${value.toFixed(8)}`
//   }

//   // Format percent change
//   const formatPercentChange = (value: number) => {
//     const sign = value >= 0 ? "+" : ""
//     return `${sign}${value.toFixed(2)}%`
//   }

//   return (
//     <div className="flex flex-col gap-4 max-w-md mx-auto">
//       {tokenData.map((token, index) => (
//         <div key={token.id} className="p-4 rounded-lg">
//           <div className="flex justify-between items-center mb-2">
//             <div className="text-gray-400 font-medium">{token.name}</div>
//             <div className="flex items-center gap-2">
//               <div className="text-white font-medium">{loading ? "$..." : formatUsdValue(token.usdValue)}</div>
//               <div
//                 className={`${token.percentChange >= 0 ? "text-green-400 bg-green-400/10" : "text-white bg-red-900/80"
//                   } px-2 py-0.5 rounded text-sm`}
//               >
//                 {loading ? "..." : formatPercentChange(token.percentChange)}
//               </div>
//             </div>
//           </div>
//           <div className="h-12 w-full">
//             {loading ? (
//               <div className="h-full w-full flex items-center justify-center">
//                 <div className="animate-pulse bg-gray-700/50 h-6 w-full rounded"></div>
//               </div>
//             ) : (
//               <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
//                 <path d={generatePath(token.prices)} fill="none" stroke="#4ade80" strokeWidth="1.5" />
//               </svg>
//             )}
//           </div>
//         </div>
//       ))}

//       {/* Expand Charts Button */}
//       <Button
//         variant="outline"
//         className="border-green-400 text-green-400 hover:bg-green-400/10 hover:text-green-400 w-full"
//         onClick={() => setExpanded(!expanded)}
//       >
//         <ExternalLink className="w-5 h-5 mr-2" />
//         Expand Charts
//       </Button>
//     </div>
//   )
// }
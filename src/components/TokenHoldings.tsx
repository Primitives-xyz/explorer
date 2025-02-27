import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TokenHoldings({ walletAddress }: { walletAddress: string }) {
  // In a real app, you'd fetch the token holdings for the wallet address
  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.5", value: "$5,000" },
    { symbol: "USDC", name: "USD Coin", balance: "1000", value: "$1,000" },
    { symbol: "LINK", name: "Chainlink", balance: "100", value: "$700" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">{token.name}</p>
                  </div>
                </TableCell>
                <TableCell>{token.balance}</TableCell>
                <TableCell>{token.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}


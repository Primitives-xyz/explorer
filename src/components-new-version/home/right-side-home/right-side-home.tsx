import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui/card'
import { ArrowDownUp } from 'lucide-react'

export function RightSideHome() {
  return (
    <div className="pt-[100px] space-y-4 flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pay</span>
            <span className="text-sm text-muted">Balance: 0.055</span>
          </CardTitle>
        </CardHeader>
        <CardContent>0.00</CardContent>
      </Card>

      <div className="flex items-center w-full justify-center">
        <ArrowDownUp />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receive</CardTitle>
        </CardHeader>
        <CardContent>0.00</CardContent>
      </Card>
    </div>
  )
}

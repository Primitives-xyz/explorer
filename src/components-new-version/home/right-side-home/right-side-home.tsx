import { Button, ButtonSize, ButtonVariant } from '@/components-new-version/ui'
import { Card, CardContent } from '@/components-new-version/ui/card'
import { ArrowDownUp } from 'lucide-react'

export function RightSideHome() {
  return (
    <div className="pt-[100px] space-y-4 flex flex-col">
      <Card>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>Pay</p>
              <p className="text-xs text-muted">Balance: 0.055</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-primary text-xl">0.00</p>
              <p className="text-xs text-muted">~USD VALUE</p>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button
                variant={ButtonVariant.OUTLINE}
                className="rounded-full"
                size={ButtonSize.SM}
              >
                25%
              </Button>
              <Button
                variant={ButtonVariant.OUTLINE}
                className="rounded-full"
                size={ButtonSize.SM}
              >
                50%
              </Button>
              <Button
                variant={ButtonVariant.OUTLINE}
                className="rounded-full"
                size={ButtonSize.SM}
              >
                max
              </Button>
            </div>
          </div>

          <div className="flex items-center w-full justify-between text-muted space-x-2">
            <div className="bg-muted w-full h-[1px]" />
            <ArrowDownUp size={40} />
            <div className="bg-muted w-full h-[1px]" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>Receive</p>
              <p className="text-xs text-muted">Balance: 0.055</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-primary text-xl">0.00</p>
              <p className="text-xs text-muted">~USD VALUE</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

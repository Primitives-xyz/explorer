import { formatNumber } from '@/components-new-version/utils/utils'
import { Globe, X } from 'lucide-react'
import { ReactNode } from 'react'

export function AboutTabContent() {
  const circulatingSupply = 200000000
  const totalSupply = 1000000000
  const percentage = ((circulatingSupply / totalSupply) * 100).toFixed(2)

  return (
    <div>
      <div className="pb-4 flex justify-between">
        <div className="w-1/2">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
        <div className="w-1/2 flex flex-col items-end space-y-2">
          <Badge
            text="https://website.com/websites"
            icon={<Globe className="text-primary" size={16} />}
          />
          <Badge
            text="TwitterHandle"
            icon={<X className="text-primary" size={16} />}
          />
        </div>
      </div>
      <div className="space-y-2">
        <p>Market Info</p>
        <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <p>Decimals</p>
            <p>Token Program</p>
            <p>Markets</p>
            <p>Circulating Supply</p>
            <p>Total Supply</p>
          </div>
          <div className="space-y-1 text-right">
            <p>6</p>
            <p>Tokenkeg302hnskfwofeihfFHOWEIFHJV</p>
            <p>171</p>
            <p>{`${formatNumber(circulatingSupply)} (${percentage}%)`}</p>
            <p>{formatNumber(totalSupply)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BadgeProps {
  text?: string
  icon: ReactNode
}

export function Badge({ text, icon }: BadgeProps) {
  return (
    <div className="bg-primary/10 rounded-full h-8 flex items-center justify-center px-4 gap-2">
      {icon}
      <p className="text-xs text-primary font-bold">|</p>
      <p className="text-xs">{text}</p>
    </div>
  )
}

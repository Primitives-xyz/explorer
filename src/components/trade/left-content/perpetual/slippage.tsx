import { Button, ButtonVariant, Input } from "@/components/ui";
import { ChevronDown, ChevronUp, Infinity, Zap } from "lucide-react";

interface SlippageProps {
  slippageExpanded: boolean
  slippageOption: string
  setSlippageExpanded: (value: boolean) => void
  setSlippageOption: (value: string) => void
  handleDynamicSlippage: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const slippageOptions = [
  { value: '0.1', label: '0.1%' },
  { value: '0.5', label: '0.5%' },
  { value: '1', label: '1%' },
  { value: 'zap', icon: <Zap size={16} /> },
  { value: 'infinity', icon: <Infinity size={16} /> },
]

export function Slippage({
  slippageExpanded,
  slippageOption,
  setSlippageExpanded,
  setSlippageOption,
  handleDynamicSlippage
}: SlippageProps) {
  return (
    <>
      <div className="space-y-6" >
        <Button
          variant={ButtonVariant.OUTLINE_WHITE}
          onClick={() => setSlippageExpanded(!slippageExpanded)}
          className="w-full justify-between"
        >
          <span>Slippage Tolerance (Dynamic)</span>
          {slippageExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </Button>

        {
          slippageExpanded && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {slippageOptions.map((option) => (
                  <Button
                    variant={
                      slippageOption === option.value
                        ? ButtonVariant.DEFAULT
                        : ButtonVariant.BADGE
                    }
                    key={option.value}
                    className="px-0"
                    onClick={() => setSlippageOption(option.value)}
                  >
                    {option.icon || option.label}
                  </Button>
                ))}
              </div>
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Custom"
                  className="text-primary"
                  onChange={(e) => handleDynamicSlippage(e)}
                  value={isNaN(Number(slippageOption)) ? '' : `${slippageOption}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                  %
                </span>
              </div>
            </div>
          )
        }
      </div >
    </>
  )
}
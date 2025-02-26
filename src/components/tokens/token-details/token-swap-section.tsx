import { JupiterSwapForm } from '@/components/transactions/jupiter-swap-form'

interface TokenSwapSectionProps {
  tokenId: string
  tokenSymbol: string
  inputDecimals?: number
}

export function TokenSwapSection({
  tokenId,
  tokenSymbol,
  inputDecimals = 9,
}: TokenSwapSectionProps) {
  return (
    <div className="bg-black/40 border border-green-800/40 rounded-xl overflow-hidden mb-6 p-4">
      <JupiterSwapForm
        initialInputMint="So11111111111111111111111111111111111111112"
        initialOutputMint={tokenId}
        inputTokenName="SOL"
        outputTokenName={tokenSymbol}
        inputDecimals={inputDecimals}
      />
    </div>
  )
}

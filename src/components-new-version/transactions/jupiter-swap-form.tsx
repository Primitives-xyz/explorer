import type { JupiterSwapFormProps } from '@/types/jupiter'
import { SwapForm } from './swap/swap-form'

export function JupiterSwapForm(props: JupiterSwapFormProps) {
  return <SwapForm {...props} />
}

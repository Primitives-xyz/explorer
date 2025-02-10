import { SwapForm } from './swap/SwapForm'
import type { JupiterSwapFormProps } from '@/types/jupiter'

export function JupiterSwapForm(props: JupiterSwapFormProps) {
  return <SwapForm {...props} />
}

import { SOL_MINT, SSE_MINT } from '@/components-new-version/utils/constants'
import { create } from 'zustand'
import { ESwapMode, ISwapInputs } from '../swap.models'

interface State {
  open: boolean
  inputs: ISwapInputs
  setOpen: (open: boolean) => void
  setInputs: (inputs: ISwapInputs) => void
}

export const useSwapStore = create<State>()((set) => ({
  open: false,
  inputs: {
    inputMint: SOL_MINT,
    outputMint: SSE_MINT,
    inputAmount: 0,
    outputAmount: 0,
    mode: ESwapMode.EXACT_IN,
  },
  setOpen: (open) =>
    set(() => ({
      open,
    })),
  setInputs: (inputs: ISwapInputs) =>
    set(() => ({
      inputs: {
        ...inputs,
        inputMint: inputs.inputMint || SOL_MINT,
        outputMint: inputs.outputMint || SSE_MINT,
        inputAmount: inputs.inputAmount || 0,
        outputAmount: inputs.outputAmount || 0,
        mode: inputs.mode || ESwapMode.EXACT_IN,
      },
    })),
}))

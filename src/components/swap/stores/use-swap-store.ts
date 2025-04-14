import { SOL_MINT, SSE_MINT } from '@/components/utils/constants'
import { create } from 'zustand'
import { ISwapInputs } from '../swap.models'

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
      },
    })),
}))

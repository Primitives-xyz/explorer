import { SOL_MINT, SSE_MINT } from '@/utils/constants'
import { create } from 'zustand'
import { ESwapMode, ISwapInputs } from '../swap.models'

interface State {
  open: boolean
  inputs: ISwapInputs
  swapMode: ESwapMode
  inAmount: string
  outAmount: string
  isNestedModal: boolean
  setOpen: (open: boolean) => void
  setInputs: (inputs: ISwapInputs) => void
  setSwapMode: (mode: ESwapMode) => void
  setInAmount: (amount: string) => void
  setOutAmount: (amount: string) => void
  setIsNestedModal: (isNested: boolean) => void
}

export const useSwapStore = create<State>()((set) => ({
  open: false,
  inputs: {
    inputMint: SOL_MINT,
    outputMint: SSE_MINT,
    inputAmount: 0,
  },
  swapMode: ESwapMode.EXACT_IN,
  inAmount: '1',
  outAmount: '',
  isNestedModal: false,
  setOpen: (open) =>
    set((state) => ({
      open,
      isNestedModal: open ? state.isNestedModal : false,
    })),
  setInputs: (inputs: ISwapInputs) =>
    set(() => ({
      inputs: {
        ...inputs,
        inputMint: inputs.inputMint || SOL_MINT,
        outputMint: inputs.outputMint || SSE_MINT,
        inputAmount:
          typeof inputs.inputAmount === 'number' ? inputs.inputAmount : 0,
        sourceWallet: inputs.sourceWallet || undefined,
        sourceTransactionId: inputs.sourceTransactionId || undefined,
        platform: inputs.platform || 'main',
      },
      inAmount:
        typeof inputs.inputAmount === 'number'
          ? inputs.inputAmount.toString()
          : '0',
    })),
  setSwapMode: (mode) => set(() => ({ swapMode: mode })),
  setInAmount: (amount) => set(() => ({ inAmount: amount })),
  setOutAmount: (amount) => set(() => ({ outAmount: amount })),
  setIsNestedModal: (isNested) => set(() => ({ isNestedModal: isNested })),
}))

import { Modal } from '@/components/common/modal'
import { JupiterSwapForm } from '@/components/transactions/jupiter-swap-form'
import { Tab } from '@headlessui/react'

interface JupiterSwapModalProps {
  isOpen: boolean
  onClose: () => void
  tokenAddress: string
  tokenSymbol: string
}

export function JupiterSwapModal({
  isOpen,
  onClose,
  tokenAddress,
  tokenSymbol,
}: JupiterSwapModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Trade ${tokenSymbol}`}>
      <Tab.Group className="h-full flex flex-col">
        <Tab.List className="flex space-x-1 border-b border-green-800/40">
          <Tab
            className={({ selected }) =>
              `flex-1 px-6 py-4 text-lg font-mono outline-none ${
                selected
                  ? ' bg-green-900/20'
                  : '/60 hover:/80 hover:bg-green-900/10'
              } transition-colors`
            }
          >
            Swap SOL
          </Tab>
          <Tab
            className={({ selected }) =>
              `flex-1 px-6 py-4 text-lg font-mono outline-none ${
                selected
                  ? ' bg-green-900/20'
                  : '/60 hover:/80 hover:bg-green-900/10'
              } transition-colors`
            }
          >
            Swap USDC
          </Tab>
        </Tab.List>
        <Tab.Panels className="flex-1 flex flex-col">
          <Tab.Panel className="flex-1 flex flex-col h-full">
            <div className="flex-1 p-6">
              <JupiterSwapForm
                initialInputMint="So11111111111111111111111111111111111111112"
                initialOutputMint={tokenAddress}
                inputTokenName="SOL"
                outputTokenName={tokenSymbol}
                inputDecimals={9}
              />
            </div>
          </Tab.Panel>
          <Tab.Panel className="flex-1 flex flex-col h-full">
            <div className="flex-1 p-6">
              <JupiterSwapForm
                initialInputMint="H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump"
                initialOutputMint={tokenAddress}
                inputTokenName="USDC"
                outputTokenName={tokenSymbol}
                inputDecimals={6}
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Modal>
  )
}

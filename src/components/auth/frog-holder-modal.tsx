import { Modal } from '@/components/common/modal'

interface FrogHolderModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FrogHolderModal = ({ isOpen, onClose }: FrogHolderModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-md w-full bg-black border border-green-800">
        <h2 className="text-xl font-mono  mb-4">Access Required</h2>
        <p className=" font-mono mb-6">
          This feature is currently only available to Frog NFT holders. To
          access this feature, you need to own at least one Frog NFT.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-900/30 border border-green-500  hover:bg-green-900/50 font-mono text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

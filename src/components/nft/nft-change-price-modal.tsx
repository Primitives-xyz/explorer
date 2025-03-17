import { useNftChangePrice } from '@/hooks/use-nft-change-price'
import { NFT } from '@/utils/types'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { Fragment, useEffect } from 'react'

interface NFTChangePriceModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFT
}

export function NFTChangePriceModal({
  isOpen,
  onClose,
  nft,
}: NFTChangePriceModalProps) {
  const {
    handleNftChangePrice,
    newPrice,
    setNewPrice,
    showNftChangePriceLoading,
    setIsChangePriceModalOpen,
  } = useNftChangePrice(nft)

  // Sync the modal state with the parent component
  useEffect(() => {
    setIsChangePriceModalOpen(isOpen)
  }, [isOpen, setIsChangePriceModalOpen])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black border border-green-800/40 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  Change Listing Price
                </Dialog.Title>

                <div className="mt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      Current Price:
                    </span>
                    <span className="text-white font-medium">
                      {nft.price?.amount || 0} {nft.price?.currency || 'SOL'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-400"
                    >
                      New Price ({nft.price?.currency || 'SOL'})
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="price"
                        id="price"
                        className="block w-full rounded-md border-0 bg-black/50 py-2 px-4 text-white shadow-sm ring-1 ring-inset ring-green-800/40 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-green-500 sm:text-sm sm:leading-6"
                        placeholder="Enter new price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <motion.button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-400 hover:to-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNftChangePrice}
                    disabled={showNftChangePriceLoading || !newPrice}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {showNftChangePriceLoading
                      ? 'Updating Price...'
                      : 'Update Price'}
                  </motion.button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

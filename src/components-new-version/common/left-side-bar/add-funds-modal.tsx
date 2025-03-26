"use client"

import { useState } from "react"
import { ChevronDown, CircleAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/components-new-version/utils/utils"

interface AddFundsModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

export default function AddFundsModal({ isOpen, setIsOpen }: AddFundsModalProps) {
  const [selectedTab, setSelectedTab] = useState("wallet")
  const [amount, setAmount] = useState("")
  const [isChecked, setIsChecked] = useState(false)

  return (
    <div>
      <div
        className={cn(
          "fixed inset-0 z-50 flex justify-start bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false)
        }}
      >
        <div
          className={cn(
            "w-full max-w-md bg-gray-950 text-gray-300 shadow-xl transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <h2 className="text-2xl font-bold text-white">Add funds</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="p-4 space-y-6">
            {/* Deposit Collateral From */}
            <div className="space-y-2">
              <p className="text-gray-400">Deposit Collateral From</p>
              <div className="flex rounded-md overflow-hidden">
                <button
                  className={`px-6 py-2 ${selectedTab === "wallet" ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-400"}`}
                  onClick={() => setSelectedTab("wallet")}
                >
                  Wallet
                </button>
                <button
                  className={`px-6 py-2 ${selectedTab === "account" ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-400"}`}
                  onClick={() => setSelectedTab("account")}
                >
                  Account
                </button>
              </div>
            </div>

            {/* Transfer type and Amount */}
            <div className="space-y-2">
              <p className="text-gray-400">Transfer type and Amount</p>
              <div className="flex rounded-md overflow-hidden border border-gray-800">
                <div className="flex items-center gap-2 bg-gray-900 px-4 py-2">
                  <div className="h-6 w-6 rounded-full bg-white"></div>
                  <span>SOL</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-gray-900 px-4 py-2 text-right focus:outline-none"
                />
              </div>
            </div>

            {/* Available balance */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Available balance</p>
              <div className="flex items-center gap-4">
                <span>2.906883136 SOL</span>
                <Button variant="outline" size="sm" className="h-8 rounded-md bg-gray-800 hover:bg-gray-700">
                  50%
                </Button>
                <Button variant="outline" size="sm" className="h-8 rounded-md bg-gray-800 hover:bg-gray-700">
                  Max
                </Button>
              </div>
            </div>

            <p className="text-gray-400">Depositing funds from wallet</p>

            {/* Account creation notice */}
            <div className="rounded-md border border-gray-800 bg-gray-900 p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-900/30 text-yellow-500">
                  <CircleAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-yellow-500">Creating an account costs 0.0314 SOL</p>
                </div>
                <div className="ml-auto">
                  <CircleAlert className="h-5 w-5 text-gray-600" />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 border-gray-600"
                />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I understand that dynamic fees are in place as a safe guard and that rent can be reclaimed upon
                  account deletion, other than the 0.0001 SOL New Account Fee.
                </label>
              </div>
            </div>

            {/* Asset Balance */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Asset Balance</p>
              <span>2.906883136 SOL</span>
            </div>

            {/* Add button */}
            <button
              className={cn(
                "w-full py-2 text-[16px] rounded-[20px] font-bold",
                !isChecked && "bg-gray-700 cursor-not-allowed",
                isChecked && "bg-[#97EF83] hover:bg-[#64e947] text-[#292C31]  cursor-pointer"
              )}
              disabled={!isChecked || !amount}>
              ADD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


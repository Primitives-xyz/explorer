'use client'

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import TokenDetails from "./token-details"
import Transactions from "./transactions"
import { useCurrentWallet } from "@/components-new-version/utils/use-current-wallet"


enum Tabs {
  Token_Details = "token details",
  Transactions = "transactions"
}

enum TokenDetailsFilter {
  About = "About",
  Holders = "Token Holders",
  Markets = "Markets"
}

enum TransactionsFilter {
  All = "All",
  Day = "24h",
  Week = "Last Week",
  Month = "Last Month"
}

interface DetailsProps {
  id: string
  description: string
  decimals: number
  tokenProgram: string
}

const Details = ({ id, description, decimals, tokenProgram }: DetailsProps) => {
  const {walletAddress} = useCurrentWallet()
  const [tab, setTab] = useState<Tabs>(Tabs.Token_Details)
  const [isTokenDetailsFilterDropdownOpen, setIsTokenDetailsFilterDropdownOpen] = useState<boolean>(false)
  const [isTransactionFilterDropdownOpen, setIsTransactionFilterDropdownOpen] = useState<boolean>(false)
  const [tokenDetailsFilter, setTokenDetailsFilter] = useState<TokenDetailsFilter>(TokenDetailsFilter.About)
  const [transactionsFilter, setTransactionsFilter] = useState<TransactionsFilter>(TransactionsFilter.All)

  const tokenDetailsFilterToggleDropdown = () => {
    setIsTokenDetailsFilterDropdownOpen(!isTokenDetailsFilterDropdownOpen)
  }

  const transactionsFilterToggleDropdown = () => {
    setIsTransactionFilterDropdownOpen(!isTransactionFilterDropdownOpen)
  }

  return (
    <div className='bg-white/5 border border-white/20 rounded-[20px] p-4'>
      <div className="flex justify-between items-center p-4 border-b border-white/20">
        <div className="flex space-x-6">
          <button
            className={`px-4 py-1 text-[14px] font-bold leading-[150%] rounded-[20px] capitalize ${tab == Tabs.Token_Details ? "bg-[#97EF83] text-[#2A2C31]" : "text-[#F5F8FD]"}`}
            onClick={() => setTab(Tabs.Token_Details)}
          >
            Token Details
          </button>
          <button
            className={`px-4 py-1 text-[14px] font-bold leading-[150%] rounded-[20px] capitalize ${tab == Tabs.Transactions ? "bg-[#97EF83] text-[#2A2C31]" : "text-[#F5F8FD]"}`}
            onClick={() => setTab(Tabs.Transactions)}
          >
            Your Transactions
          </button>
        </div>
        <div className="relative z-10">
          <button className="flex items-center space-x-2 text-[#97EF83] font-bold" onClick={tab == Tabs.Token_Details ? tokenDetailsFilterToggleDropdown : transactionsFilterToggleDropdown}>
            <span>{tab == Tabs.Token_Details ? tokenDetailsFilter : transactionsFilter}</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${isTokenDetailsFilterDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isTokenDetailsFilterDropdownOpen && tab == Tabs.Token_Details && (
            <div className="absolute right-0 mt-2 w-48 rounded-[20px] border border-[rgba(151,239,131,0.2)] bg-[rgba(151,239,131,0.2)] shadow-[0px_0px_4.6px_0px_rgba(151,239,131,0.2)] backdrop-blur-md">
              <div className="p-4 space-y-3 font-bold">
                <div
                  className="text-[#97EF83] hover:text-green-500 cursor-pointer"
                  onClick={() => {
                    setTokenDetailsFilter(TokenDetailsFilter.About)
                    setIsTokenDetailsFilterDropdownOpen(false)
                  }}
                >
                  {TokenDetailsFilter.About}
                </div>
                <div
                  className="text-[#97EF83] hover:text-green-400 cursor-pointer"
                  onClick={() => {
                    setTokenDetailsFilter(TokenDetailsFilter.Holders)
                    setIsTokenDetailsFilterDropdownOpen(false)
                  }}
                >
                  {TokenDetailsFilter.Holders}
                </div>
                <div
                  className="text-[#97EF83] hover:text-green-500 cursor-pointer"
                  onClick={() => {
                    setTokenDetailsFilter(TokenDetailsFilter.Markets)
                    setIsTokenDetailsFilterDropdownOpen(false)
                  }}
                >
                  {TokenDetailsFilter.Markets}
                </div>
              </div>
            </div>
          )}

          {isTransactionFilterDropdownOpen && tab == Tabs.Transactions && (
            <div className="absolute right-0 mt-2 w-48 rounded-[20px] border border-[rgba(151,239,131,0.2)] bg-[rgba(151,239,131,0.2)] shadow-[0px_0px_4.6px_0px_rgba(151,239,131,0.2)] backdrop-blur-md">
              <div className="p-4 space-y-3 font-bold">
                <div
                  className="text-[#97EF83] hover:text-green-500 cursor-pointer"
                  onClick={() => {
                    setTransactionsFilter(TransactionsFilter.All)
                    setIsTransactionFilterDropdownOpen(false)
                  }}
                >{TransactionsFilter.All}</div>
                <div
                  className="text-[#97EF83] hover:text-green-400 cursor-pointer"
                  onClick={() => {
                    setTransactionsFilter(TransactionsFilter.Day)
                    setIsTransactionFilterDropdownOpen(false)
                  }}
                >
                  {TransactionsFilter.Day}
                </div>
                <div
                  className="text-[#97EF83] hover:text-green-500 cursor-pointer"
                  onClick={() => {
                    setTransactionsFilter(TransactionsFilter.Week)
                    setIsTransactionFilterDropdownOpen(false)
                  }}
                >
                  {TransactionsFilter.Week}
                </div>
                <div
                  className="text-[#97EF83] hover:text-green-500 cursor-pointer"
                  onClick={() => {
                    setTransactionsFilter(TransactionsFilter.Month)
                    setIsTransactionFilterDropdownOpen(false)
                  }}
                >
                  {TransactionsFilter.Month}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {
        tab == Tabs.Token_Details && (
          <TokenDetails
            id={id}
            decimals={decimals}
            tokenProgram={tokenProgram}
            description={description}
            filter={tokenDetailsFilter}
          />
        )
      }

      {
        tab == Tabs.Transactions && (
          <Transactions
            id={id}
            walletAddress={walletAddress}
            filter={transactionsFilter}
          />
        )
      }
    </div >
  )
}

export default Details
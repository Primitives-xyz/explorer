'use client'

import { TokenSearchResult } from "@/components/transactions/swap/types/token-types"
import { sortTokenResults } from "@/components/transactions/swap/utils/token-utils"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

interface SearchTokenListsProps {
  isLoading: boolean,
  tokenLists: TokenSearchResult[]
}

const SearchTokenLists = (props: SearchTokenListsProps) => {
  const [searchTokenListsFilteredByName, setSearchTokenListsFilteredByName] = useState<TokenSearchResult[]>([])

  useEffect(() => {
    const sortedRes = sortTokenResults(
      props.tokenLists,
      "name"
    )
      .filter((token) => token.verified)
      .sort((a, b) => (b.prioritized ? 1 : -1))

    setSearchTokenListsFilteredByName(sortedRes)

  }, [props.tokenLists])

  return (
    <>
      {
        props.isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )
      }
      {
        !searchTokenListsFilteredByName.length && (
          <div className="p-4 text-center">
            No Verified Tokens
          </div>
        )
      }
      {
        searchTokenListsFilteredByName.length && (
          <div>
            {
              searchTokenListsFilteredByName.map((token, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-1 items-center"
                >
                  <Image
                    src={token.logoURI!}
                    alt="token logo"
                    height={8}
                    width={8}
                  >
                  </Image>
                  <div>
                    <p>{token.symbol}</p>
                    <div className="flex flex-row justify-between">
                      <p>{token.name}</p>
                      <p>{token.address}</p>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </>
  )
}

export default SearchTokenLists;
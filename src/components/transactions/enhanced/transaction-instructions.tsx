'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import {
  ParsedInstruction,
  Transaction,
} from '@/components/tapestry/models/helius.models'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight, FileCode } from 'lucide-react'
import { useState } from 'react'

interface TransactionInstructionsProps {
  transaction: Transaction
}

export function TransactionInstructions({
  transaction,
}: TransactionInstructionsProps) {
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(
    new Set()
  )

  const toggleInstruction = (index: number) => {
    const newExpanded = new Set(expandedInstructions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedInstructions(newExpanded)
  }

  const instructions = transaction.parsedInstructions || []

  if (instructions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No instructions found
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileCode size={20} />
        <h3 className="text-lg font-semibold">
          Instructions ({instructions.length})
        </h3>
      </div>

      {instructions.map((instruction: ParsedInstruction, index: number) => {
        const isExpanded = expandedInstructions.has(index)

        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleInstruction(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <CardTitle className="text-sm">
                    Instruction #{index + 1}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {instruction.programId ? 'Program' : 'Unknown'}
                  </Badge>
                </div>
                {instruction.programId && (
                  <SolanaAddressDisplay
                    address={instruction.programId}
                    highlightable={true}
                    showCopyButton={true}
                    displayAbbreviatedAddress={true}
                    className="text-xs"
                  />
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t">
                <div className="space-y-4">
                  {/* Program ID */}
                  {instruction.programId && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Program ID
                      </p>
                      <SolanaAddressDisplay
                        address={instruction.programId}
                        highlightable={true}
                        showCopyButton={true}
                        displayAbbreviatedAddress={false}
                        className="text-sm font-mono"
                      />
                    </div>
                  )}

                  {/* Accounts */}
                  {instruction.accounts && instruction.accounts.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Accounts ({instruction.accounts.length})
                      </p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {instruction.accounts.map(
                          (account: string, accIndex: number) => (
                            <div
                              key={accIndex}
                              className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50"
                            >
                              <span className="text-xs text-muted-foreground">
                                #{accIndex + 1}
                              </span>
                              <SolanaAddressDisplay
                                address={account}
                                highlightable={true}
                                showCopyButton={true}
                                displayAbbreviatedAddress={true}
                                className="text-xs"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data (if available) */}
                  {instruction.data && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data</p>
                      <div className="bg-muted rounded p-2">
                        <code className="text-xs break-all">
                          {instruction.data}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Decoded Data */}
                  {instruction.decodedData && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Decoded Data
                      </p>
                      <div className="bg-muted rounded p-2">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(instruction.decodedData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

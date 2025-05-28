'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { Transaction } from '@/components/tapestry/models/helius.models'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Package } from 'lucide-react'

interface TransactionProgramsProps {
  transaction: Transaction
}

// Known program names mapping
const KNOWN_PROGRAMS: Record<string, string> = {
  '11111111111111111111111111111111': 'System Program',
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'Token Program',
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: 'Associated Token Program',
  ComputeBudget111111111111111111111111111111: 'Compute Budget Program',
  JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: 'Jupiter Aggregator v6',
  JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB: 'Jupiter Aggregator v4',
  whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: 'Orca Whirlpool',
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM V4',
  CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK: 'Raydium CLMM',
  MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: 'Memo Program',
  Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo: 'Memo Program v1',
}

export function TransactionPrograms({ transaction }: TransactionProgramsProps) {
  // Extract unique program IDs from parsed instructions
  const programIds = new Set<string>()

  if (transaction.parsedInstructions) {
    transaction.parsedInstructions.forEach((instruction) => {
      if (instruction.programId) {
        programIds.add(instruction.programId)
      }
    })
  }

  // Also check account data for programs
  if (transaction.accountData) {
    transaction.accountData.forEach((account) => {
      // You might want to add logic here to identify program accounts
    })
  }

  const uniquePrograms = Array.from(programIds)

  if (uniquePrograms.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No programs found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Package size={20} />
        <h3 className="text-lg font-semibold">
          Programs Used ({uniquePrograms.length})
        </h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Program Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uniquePrograms.map((programId, index) => {
              const knownName = KNOWN_PROGRAMS[programId]
              const instructionCount =
                transaction.parsedInstructions?.filter(
                  (inst) => inst.programId === programId
                ).length || 0

              return (
                <div
                  key={programId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Code size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {knownName || 'Unknown Program'}
                      </p>
                      <SolanaAddressDisplay
                        address={programId}
                        highlightable={true}
                        showCopyButton={true}
                        displayAbbreviatedAddress={true}
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {instructionCount}{' '}
                      {instructionCount === 1 ? 'instruction' : 'instructions'}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Program Summary */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Programs
                </p>
                <p className="text-lg font-semibold">{uniquePrograms.length}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Known Programs
                </p>
                <p className="text-lg font-semibold">
                  {uniquePrograms.filter((id) => KNOWN_PROGRAMS[id]).length}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {transaction.source && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Source:</span>{' '}
                {transaction.source}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

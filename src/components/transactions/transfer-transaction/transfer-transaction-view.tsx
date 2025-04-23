import { Transaction } from '@/components/tapestry/models/helius.models'
import { Card, CardContent, CardHeader, CardTitle, Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import TokenTransferGraph from '@/components/transactions/common/token-transfer-graph'
import { TransferLine } from '@/components/transactions/common/transfer-line'
import { TokenLine } from '@/components/transactions/common/token-line'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Avatar } from '@/components/ui/avatar/avatar'
import { abbreviateWalletAddress, formatTimeAgo } from '@/utils/utils'
import { route } from '@/utils/route'
import { ArrowRightLeft, Share } from 'lucide-react'
import { CopyToClipboardButton } from '@/components/ui/button/copy-to-clipboard-button'

interface TransferTransactionViewProps {
  transaction: Transaction
}

function getProfileFromTransaction(transaction: Transaction): any {
  // Placeholder: you may want to fetch profile info as in SwapTransactionSummary
  return null
}

function getSentToken(transfers: any[], feePayer: string) {
  // Find the first outgoing transfer
  return transfers.find(t => t.fromUserAccount === feePayer)
}
function getReceivedToken(transfers: any[], feePayer: string) {
  // Find the first incoming transfer
  return transfers.find(t => t.toUserAccount === feePayer)
}

function getAllTransfers(transaction: Transaction) {
  return [
    ...(transaction.nativeTransfers?.map(nt => ({
      fromUserAccount: nt.fromUserAccount,
      toUserAccount: nt.toUserAccount,
      mint: 'So11111111111111111111111111111111111111112', // SOL mint
      tokenAmount: nt.amount / LAMPORTS_PER_SOL,
      isNative: true,
    })) || []),
    ...(transaction.tokenTransfers?.map(tt => ({
      fromUserAccount: tt.fromUserAccount,
      toUserAccount: tt.toUserAccount,
      mint: tt.mint || tt.tokenMint,
      tokenAmount: tt.tokenAmount,
      isNative: false,
    })) || [])
  ]
}

function TransferTransactionSummary({ transaction }: { transaction: Transaction }) {
  const feePayer = transaction.feePayer
  const profile = getProfileFromTransaction(transaction)
  // No sent/received token display, no copy trade button
  return (
    <Card className="overflow-visible">
      <CardContent className="p-4 space-y-4 overflow-visible">
        {/* Header row with user info and share button */}
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              username={profile?.username || feePayer}
              size={40}
              className="w-10"
              imageUrl={profile?.image}
            />
            <div>
              <div className="flex items-center gap-2">
                {profile?.username && profile.username !== feePayer ? (
                  <Button
                    variant={ButtonVariant.GHOST}
                    href={route('entity', {
                      id: profile.username || feePayer,
                    })}
                    className="p-0 hover:bg-transparent"
                  >
                    @{profile.username}
                  </Button>
                ) : (
                  <SolanaAddressDisplay
                    address={feePayer}
                    highlightable={true}
                    showCopyButton={false}
                  />
                )}
                <Button
                  href={route('entity', { id: transaction.signature })}
                  variant={ButtonVariant.BADGE}
                  size={ButtonSize.SM}
                >
                  {transaction.signature.slice(0, 4)}...{transaction.signature.slice(-4)}
                </Button>
                <span className="text-muted-foreground text-xs">
                  • {formatTimeAgo(new Date(transaction.timestamp * 1000))}
                </span>
              </div>
              <div className="flex items-center mt-1 text-sm">
                <span>{transaction.type}</span>
                <span className="mx-2">on</span>
                <span className="font-medium flex items-center gap-1">
                  {transaction.source}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <CopyToClipboardButton
              textToCopy={typeof window !== 'undefined' ? window.location.href : ''}
              variant={ButtonVariant.OUTLINE}
              className="min-w-[56px] px-4 text-base font-semibold"
            >
              <Share size={20} className="mr-2" />
              Share
            </CopyToClipboardButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const TransferTransactionView = ({ transaction }: TransferTransactionViewProps) => {
  console.log('transaction', transaction)
  const feePayer = transaction.feePayer
  const allTransfers = getAllTransfers(transaction)

  // Map allTransfers to the full tokenTransfer shape expected by TokenTransferGraph
  const tokenTransfersForGraph = allTransfers.map(tt => ({
    fromTokenAccount: '',
    toTokenAccount: '',
    tokenMint: tt.mint,
    amount: tt.tokenAmount,
    from: tt.fromUserAccount,
    to: tt.toUserAccount,
    fromUserAccount: tt.fromUserAccount,
    toUserAccount: tt.toUserAccount,
    tokenAmount: tt.tokenAmount,
    tokenStandard: 'Fungible',
    mint: tt.mint,
  }))

  return (
    <div className="space-y-4">
      {/* Transaction Summary */}
      <TransferTransactionSummary transaction={transaction} />

      {/* Signer and Fee Payer Section */}
      <div className="flex justify-between overflow-visible">
        {/* Signer Card */}
        <Card className="overflow-visible w-[45%]">
          <CardContent className="p-4 overflow-visible flex flex-row justify-between">
            <p className="text-sm font-medium text-muted-foreground">Signer</p>
            <div className="text-sm overflow-visible">
              <SolanaAddressDisplay
                address={feePayer}
                highlightable={true}
                showCopyButton={true}
                displayAbbreviatedAddress={true}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
        {/* Fee Payer Card */}
        <Card className="overflow-visible w-[45%]">
          <CardContent className="p-4 overflow-visible flex flex-row justify-between">
            <p className="text-sm font-medium text-muted-foreground">Fee Payer</p>
            <div className="text-sm overflow-visible">
              <SolanaAddressDisplay
                address={feePayer}
                highlightable={true}
                showCopyButton={true}
                displayAbbreviatedAddress={true}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Summary Title */}
      <div className="flex items-center justify-between mb-2">
        <CardTitle>Summary</CardTitle>
      </div>
      {/* Token Transfer Graph */}
      <Card className="overflow-visible;">
        <CardContent className="overflow-visible p-0">
          <TokenTransferGraph transaction={{ ...transaction, tokenTransfers: tokenTransfersForGraph }} />
        </CardContent>
      </Card>
      {/* Transaction Lines Section */}
      <div className="overflow-visible">
        <div className="space-y-2">
          {allTransfers.length > 0 ? (
            allTransfers.map((tt, i) => (
              <TransferLine
                key={i}
                from={tt.fromUserAccount}
                to={tt.toUserAccount}
                mint={tt.mint}
                amount={tt.tokenAmount}
                timestamp={transaction.timestamp}
                direction={tt.fromUserAccount === feePayer ? 'out' : tt.toUserAccount === feePayer ? 'in' : undefined}
                className="bg-[#97EF830D] rounded"
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground p-3">No transfers found for this transaction</div>
          )}
        </div>
      </div>
    </div>
  )
}

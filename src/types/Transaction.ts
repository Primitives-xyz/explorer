export interface TransactionStatusUpdate {
  status:
    | 'sending'
    | 'sent'
    | 'confirming'
    | 'confirmed'
    | 'failed'
    | 'timeout'
  signature?: string
  error?: string
}

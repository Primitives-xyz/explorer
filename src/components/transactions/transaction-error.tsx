import { Paragraph } from '@/components/ui'

interface TransactionErrorProps {
  errorMessage: string
}

export const TransactionError = ({ errorMessage }: TransactionErrorProps) => (
  <div className="py-4">
    <Paragraph className="text-muted-foreground">
      Error loading transaction: {errorMessage}
    </Paragraph>
  </div>
) 
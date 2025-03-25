enum TransactionsFilter {
  All = "All",
  Day = "24h",
  Week = "Last Week",
  Month = "Last Month"
}

interface TransactionsProps {
  id: string
  walletAddress: string
  filter: TransactionsFilter
}

const Transactions = ({
  id,
  walletAddress,
  filter
}: TransactionsProps) => {
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      Coming Soon....
    </div>
  )
}

export default Transactions
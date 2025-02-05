import Link from 'next/link'

interface Props {
  variant?: 'modal' | 'inline'
}

export function FrogHolderRequired({ variant = 'modal' }: Props) {
  console.log({ variant })
  return (
    <div className="space-y-4">
      <p className="text-green-400/80">
        You need to be a Solana Business Frog holder to use the social features
        of this site.
      </p>
      <p className="text-green-400/80">
        You can buy one on{' '}
        <Link
          href="https://tensor.trade/trade/sbf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-green-300 underline"
        >
          Tensor
        </Link>
        .
      </p>
    </div>
  )
}

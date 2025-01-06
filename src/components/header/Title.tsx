import Link from 'next/link'

export const Title = () => {
  return (
    <Link href="/" className="hover:opacity-80 transition-opacity">
      <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-green-400 truncate">
        {`>`} social_graph_explorer.sol
      </h1>
    </Link>
  )
}

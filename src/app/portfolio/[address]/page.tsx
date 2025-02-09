import PortfolioTabs from './PortfolioTabs'

type Params = Promise<{ address: string }>

export default async function PortfolioPage({ params }: { params: Params }) {
  const resolvedParams = await params
  const { address } = resolvedParams

  return (
    <div className="min-h-[100dvh] w-[100dvw] overflow-x-hidden ">
      <div className="flex-grow p-4 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-mono text-green-400 mb-2">
              Portfolio
            </h2>
            <p className="text-green-600 break-all font-mono">{address}</p>
          </div>

          <PortfolioTabs address={address} />
        </div>
      </div>
    </div>
  )
}

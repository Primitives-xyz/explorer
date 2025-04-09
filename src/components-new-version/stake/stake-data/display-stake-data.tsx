import { Spinner } from '@/components-new-version/ui'

interface Props {
  label: string
  value: string
  loading: boolean
}

export function DisplayStakeData({ label, value, loading }: Props) {
  return (
    <div>
      <div className="items-center flex text-lg space-x-2 mb-2">
        <p className="font-bold text-primary">SSE</p>
        <p>{label}</p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex space-x-2">
          <span className="text-3xl text-primary font-bold">{value}</span>
          <span className="text-primary">tokens</span>
        </div>
      )}
    </div>
  )
}

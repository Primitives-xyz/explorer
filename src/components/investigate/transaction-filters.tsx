'use client'

export interface FilterState {
  status: string
  tokenAccounts: string
  sortOrder: string
  blockTimeGte: string
  blockTimeLte: string
}

interface Props {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function TransactionFilters({ filters, onChange }: Props) {
  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-card/50 border border-border/20 rounded-md">
      {/* Status */}
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(v) => update('status', v)}
        options={[
          { value: 'any', label: 'All' },
          { value: 'succeeded', label: 'Success' },
          { value: 'failed', label: 'Failed' },
        ]}
      />

      {/* Token Accounts */}
      <FilterSelect
        label="Scope"
        value={filters.tokenAccounts}
        onChange={(v) => update('tokenAccounts', v)}
        options={[
          { value: 'none', label: 'Direct only' },
          { value: 'balanceChanged', label: 'Balance changes' },
          { value: 'all', label: 'All token accounts' },
        ]}
      />

      {/* Sort */}
      <FilterSelect
        label="Order"
        value={filters.sortOrder}
        onChange={(v) => update('sortOrder', v)}
        options={[
          { value: 'desc', label: 'Newest first' },
          { value: 'asc', label: 'Oldest first' },
        ]}
      />

      {/* Date From */}
      <div>
        <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest block mb-1">
          From
        </label>
        <input
          type="date"
          value={filters.blockTimeGte}
          onChange={(e) => update('blockTimeGte', e.target.value)}
          className="w-full h-8 px-2 bg-background border border-border/40 rounded text-xs font-mono text-foreground/70 focus:outline-none focus:border-primary/40"
        />
      </div>

      {/* Date To */}
      <div>
        <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest block mb-1">
          To
        </label>
        <input
          type="date"
          value={filters.blockTimeLte}
          onChange={(e) => update('blockTimeLte', e.target.value)}
          className="w-full h-8 px-2 bg-background border border-border/40 rounded text-xs font-mono text-foreground/70 focus:outline-none focus:border-primary/40"
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest block mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 px-2 bg-background border border-border/40 rounded text-xs font-mono text-foreground/70 focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

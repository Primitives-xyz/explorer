interface FilterButtonProps {
  label: string
  isSelected: boolean
  onClick: () => void
  accentColor?: 'green' | 'indigo'
  icon?: string
  className?: string
}

export const FilterButton = ({
  label,
  isSelected,
  onClick,
  accentColor = 'green',
  icon,
  className = '',
}: FilterButtonProps) => {
  const colorClasses = {
    green: {
      selected: 'bg-green-500 text-black',
      unselected: ' hover:bg-green-500/10',
    },
    indigo: {
      selected: 'bg-indigo-500 text-black',
      unselected: 'text-indigo-500 hover:bg-indigo-500/10',
    },
  }

  const colors = colorClasses[accentColor]

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
        isSelected ? colors.selected : colors.unselected
      } ${className}`}
    >
      {icon && <img src={icon} alt="" className="w-3.5 h-3.5 rounded-full" />}
      {label}
    </button>
  )
}

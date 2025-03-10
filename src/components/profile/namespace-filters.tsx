import { FilterBar } from '@/components/common/filter-bar'
import { FilterButton } from '@/components/common/filter-button'
import { getReadableNamespace } from '@/utils/namespace-utils'
import { useTranslations } from 'next-intl'

interface Namespace {
  name: string
  readableName?: string
  faviconURL?: string | null
}

interface NamespaceFiltersProps {
  namespaces: Namespace[]
  selectedNamespace: string | null
  onNamespaceSelect: (namespace: string | null) => void
}

export const NamespaceFilters = ({
  namespaces,
  selectedNamespace,
  onNamespaceSelect,
}: NamespaceFiltersProps) => {
  const t = useTranslations()

  return (
    <FilterBar>
      <FilterButton
        label={t('common.all')}
        isSelected={selectedNamespace === null}
        onClick={() => onNamespaceSelect(null)}
      />
      {namespaces.map((namespace) => (
        <FilterButton
          key={namespace.name}
          label={getReadableNamespace(namespace)}
          isSelected={selectedNamespace === namespace.name}
          onClick={() => onNamespaceSelect(namespace.name)}
          icon={namespace.faviconURL ?? undefined}
        />
      ))}
    </FilterBar>
  )
}

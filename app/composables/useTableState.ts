import type { Project, SortDir } from './useDashboard'

/**
 * Generic sort + project-filter state for data tables.
 *
 * Sort precedence (per key):
 *  1. `'state'` key  → uses `stateOrder` map (lower = higher priority)
 *  2. key in `stringKeys` → localeCompare
 *  3. everything else → numeric comparison
 */
export function useTableState<
  TItem extends { project: string; state: string },
  TSortKey extends string,
>(
  source: TItem[],
  options: {
    initialKey: TSortKey
    initialDir?: SortDir
    stateOrder?: Record<string, number>
    stringKeys?: readonly TSortKey[]
    /** Return the default sort direction when switching to a new column. */
    defaultDirForKey?: (key: TSortKey) => SortDir
  },
) {
  const {
    initialKey,
    initialDir = 'asc',
    stateOrder,
    stringKeys = [],
    defaultDirForKey,
  } = options

  const selectedProject = ref<Project>('all')
  const sortKey = ref(initialKey) as Ref<TSortKey>
  const sortDir = ref<SortDir>(initialDir)

  const filtered = computed<TItem[]>(() => {
    const rows = selectedProject.value === 'all'
      ? source
      : source.filter(item => item.project === selectedProject.value)

    return [...rows].sort((a, b) => {
      const dir = sortDir.value === 'asc' ? 1 : -1
      const key = sortKey.value

      if (key === 'state' && stateOrder) {
        return ((stateOrder[a.state] ?? 0) - (stateOrder[b.state] ?? 0)) * dir
      }
      if ((stringKeys as readonly string[]).includes(key)) {
        return (a[key as keyof TItem] as string).localeCompare(
          b[key as keyof TItem] as string,
        ) * dir
      }
      return ((a[key as keyof TItem] as number) - (b[key as keyof TItem] as number)) * dir
    })
  })

  function toggleSort(key: TSortKey) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    }
    else {
      sortKey.value = key
      sortDir.value = defaultDirForKey ? defaultDirForKey(key) : 'desc'
    }
  }

  return { selectedProject, sortKey, sortDir, filtered, toggleSort }
}

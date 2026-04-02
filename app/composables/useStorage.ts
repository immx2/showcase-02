import { volumes, type Volume, type VolumeState } from '~/data/analytics'
import type { Project, SortDir } from '~/composables/useDashboard'

export type { VolumeState }
export type VolumeSortKey = 'name' | 'state' | 'type' | 'sizeGib' | 'usedGib' | 'project' | 'created'

const VOLUME_STATE_ORDER: Record<VolumeState, number> = {
  faulted:   0,
  creating:  1,
  attached:  2,
  available: 3,
  detached:  4,
}

export function useStorage() {
  const selectedProject = ref<Project>('all')
  const sortKey = ref<VolumeSortKey>('name')
  const sortDir = ref<SortDir>('asc')

  const filteredVolumes = computed<Volume[]>(() => {
    const rows = selectedProject.value === 'all'
      ? volumes
      : volumes.filter(v => v.project === selectedProject.value)

    return [...rows].sort((a, b) => {
      const dir = sortDir.value === 'asc' ? 1 : -1
      const key = sortKey.value

      if (key === 'state') {
        return (VOLUME_STATE_ORDER[a.state] - VOLUME_STATE_ORDER[b.state]) * dir
      }
      if (key === 'name' || key === 'type' || key === 'project' || key === 'created') {
        return a[key].localeCompare(b[key]) * dir
      }
      return ((a[key] as number) - (b[key] as number)) * dir
    })
  })

  function toggleSort(key: VolumeSortKey) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    }
    else {
      sortKey.value = key
      sortDir.value = key === 'sizeGib' || key === 'usedGib' ? 'desc' : 'asc'
    }
  }

  return { selectedProject, sortKey, sortDir, filteredVolumes, toggleSort }
}

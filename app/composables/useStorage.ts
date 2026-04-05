import { volumes, type Volume, type VolumeState } from '~/data/analytics'

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
  const {
    selectedProject,
    sortKey,
    sortDir,
    filtered: filteredVolumes,
    toggleSort,
  } = useTableState<Volume, VolumeSortKey>(volumes, {
    initialKey: 'name',
    initialDir: 'asc',
    stateOrder: VOLUME_STATE_ORDER,
    stringKeys: ['name', 'type', 'project', 'created'],
    defaultDirForKey: key => key === 'sizeGib' || key === 'usedGib' ? 'desc' : 'asc',
  })

  return { selectedProject, sortKey, sortDir, filteredVolumes, toggleSort }
}

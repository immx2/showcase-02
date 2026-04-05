import type { Volume, InstanceState } from '~/data/analytics'

export function formatGib(gib: number): string {
  return gib >= 1024 ? `${(gib / 1024).toFixed(1)} TiB` : `${gib} GiB`
}

export function usedPct(v: Volume): number {
  return v.sizeGib > 0 ? Math.round((v.usedGib / v.sizeGib) * 100) : 0
}

export function stateToStatus(state: Volume['state']): InstanceState {
  if (state === 'attached') return 'running'
  if (state === 'creating') return 'starting'
  if (state === 'faulted')  return 'faulted'
  return 'stopped'
}

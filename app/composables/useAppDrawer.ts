import type { Instance, Volume } from '~/data/analytics'

type DrawerState =
  | { type: 'instance'; item: Instance }
  | { type: 'volume';   item: Volume }
  | null

export function useAppDrawer() {
  const state = useState<DrawerState>('app-drawer', () => null)

  function openInstance(instance: Instance) { state.value = { type: 'instance', item: instance } }
  function openVolume(volume: Volume)       { state.value = { type: 'volume',   item: volume   } }
  function close()                          { state.value = null }

  return { state: readonly(state), openInstance, openVolume, close }
}

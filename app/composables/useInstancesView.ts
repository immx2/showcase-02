export function useInstancesView() {
  const instancesView = useState<'table' | 'rack'>('instances.view', () => 'table')

  function toggle() {
    instancesView.value = instancesView.value === 'table' ? 'rack' : 'table'
  }
  return { instancesView, toggle }
}

export function useCommandPalette() {
  const isOpen = useState<boolean>('command-palette.isOpen', () => false)

  function open() { isOpen.value = true }
  function close() { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }

  return { isOpen, open, close, toggle }
}

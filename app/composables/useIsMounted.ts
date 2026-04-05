export function useIsMounted() {
  const nuxtApp = useNuxtApp()
  const isMounted = ref(import.meta.client && !nuxtApp.isHydrating)
  onMounted(() => { isMounted.value = true })
  return isMounted
}

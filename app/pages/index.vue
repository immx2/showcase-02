<script setup lang="ts">
const { period, isLive, toggleLive } = useDashboard()

useHead({ title: 'SaaS Cloud Console' })

const isMounted = useIsMounted()

useEventListener('keydown', (e: KeyboardEvent) => {
  const focused = document.activeElement
  const inInput = focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || (focused as HTMLElement).isContentEditable)
  if (inInput) return

  if (e.key === 'l' || e.key === 'L') toggleLive()
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    period.value = period.value === '90d' ? '30d' : period.value === '30d' ? '7d' : '7d'
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    period.value = period.value === '7d' ? '30d' : period.value === '30d' ? '90d' : '90d'
  }
})
</script>

<template>
  <BasePageContent>
    <DashboardHeader
      v-model:period="period"
      :is-live="isLive"
      @toggle-live="toggleLive"
    />
    <DashboardSectionKpis :is-mounted="isMounted" :base-index="0" />
    <DashboardSectionCharts :is-mounted="isMounted" :base-index="4" />
  </BasePageContent>
</template>

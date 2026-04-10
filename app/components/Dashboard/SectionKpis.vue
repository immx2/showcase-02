<script setup lang="ts">
const props = defineProps<{
  isMounted: boolean
  baseIndex: number
}>()

const { kpis, isLive } = useDashboard()
const stagger = useStagger(props.baseIndex)
</script>

<template>
  <section class="kpi-grid" aria-label="Key metrics">
    <CardKpi
      v-for="(kpi, i) in kpis"
      :key="kpi.label"
      v-bind="stagger(i)"
      :kpi="kpi"
      :loading="!isMounted"
      :live="isLive"
    />
  </section>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@container (width <= 700px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}

@container (width <= 420px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>

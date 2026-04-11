<script setup lang="ts">
import {
  volumes,
  storageKpiSparklines,
} from '~/data/analytics'
import type { Kpi } from '~/composables/useDashboard'

const props = defineProps<{
  baseIndex: number
}>()

const stagger = useStagger(props.baseIndex)

const totalCapacityGib = volumes.reduce((s, v) => s + v.sizeGib, 0)
const totalUsedGib     = volumes.reduce((s, v) => s + v.usedGib, 0)
const usedPct          = totalCapacityGib > 0 ? (totalUsedGib / totalCapacityGib) * 100 : 0
const prevCapacityGib  = totalCapacityGib - 4096
const prevUsedPct      = usedPct - 4.2

const storageKpis = computed<Kpi[]>(() => [
  {
    label: 'Total Capacity',
    value: totalCapacityGib,
    previousValue: prevCapacityGib,
    format: 'bytes',
    trend: ((totalCapacityGib - prevCapacityGib) / prevCapacityGib) * 100,
    sparkline: storageKpiSparklines.capacitySparkline,
  },
  {
    label: 'Used',
    value: usedPct,
    previousValue: prevUsedPct,
    format: 'percent',
    trend: prevUsedPct > 0 ? ((usedPct - prevUsedPct) / prevUsedPct) * 100 : 0,
    trendPositiveWhenDown: true,
    sparkline: storageKpiSparklines.usedPctSparkline,
  },
  {
    label: 'Volumes',
    value: volumes.length,
    previousValue: volumes.length - 1,
    format: 'number',
    trend: ((volumes.length - (volumes.length - 1)) / (volumes.length - 1)) * 100,
    sparkline: storageKpiSparklines.volumeCountSparkline,
  },
  {
    label: 'Snapshots',
    value: 23,
    previousValue: 22,
    format: 'number',
    trend: ((23 - 22) / 22) * 100,
    sparkline: storageKpiSparklines.snapshotCountSparkline,
  },
])
</script>

<template>
  <section class="kpi-grid" aria-label="Storage metrics">
    <CardKpi
      v-for="(kpi, i) in storageKpis"
      :key="kpi.label"
      v-bind="stagger(i)"
      :kpi="kpi"
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

<script setup lang="ts">
import { storageHistory } from '~/data/analytics'

const props = defineProps<{
  isMounted: boolean
  baseIndex?: number
}>()

const storageLineSeries = storageHistory.map(s => ({ date: s.date, value: s.totalGib }))
</script>

<template>
  <section class="chart-row">
    <CardStorageBreakdown :index="props.baseIndex ?? 0" />

    <CardChart title="Capacity Growth" description="Total allocated storage · TiB" :index="(props.baseIndex ?? 0) + 1">
      <ClientOnly>
        <ChartLine
          v-if="isMounted"
          :data="storageLineSeries"
          color="var(--chart-3)"
          :format-value="(v: number) => `${Math.round(v / 1024)} TiB`"
          :format-tooltip="(v: number) => `${(v / 1024).toFixed(1)} TiB`"
          :height="240"
          :margin-left="62"
          animate
        />
        <BaseSkeleton v-else height="240px" />
      </ClientOnly>
    </CardChart>
  </section>
</template>

<style scoped>
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@container (width <= 560px) {
  .chart-row { grid-template-columns: 1fr; }
}
</style>

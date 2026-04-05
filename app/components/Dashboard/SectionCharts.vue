<script setup lang="ts">
const props = defineProps<{
  isMounted: boolean
  baseIndex?: number
}>()

const { cpuSeries, memSeries, allCpuSeries, allMemSeries, sledMultiBarData, heatmapData } = useDashboard()

const b = computed(() => props.baseIndex ?? 0)

const brushRange = ref<[Date, Date] | null>(null)

const brushDescription = computed(() => {
  if (!brushRange.value) return 'Average across all running instances · % used'
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Zoomed: ${fmt(brushRange.value[0])} – ${fmt(brushRange.value[1])} · % used`
})
</script>

<template>
  <!-- CPU + Memory time series -->
  <CardChart
    title="CPU &amp; Memory Utilization"
    :description="brushDescription"
    :index="b"
  >
    <ChartSkeletonLine v-if="!isMounted" :height="240" :show-minimap="true" />
    <ClientOnly v-else>
      <ChartLine
        :data="cpuSeries"
        :data2="memSeries"
        :full-data="allCpuSeries"
        :full-data2="allMemSeries"
        color="var(--chart-1)"
        color2="var(--chart-2)"
        :series-meta="[{ label: 'CPU', color: 'var(--chart-1)' }, { label: 'Mem', color: 'var(--chart-2)' }]"
        :format-value="(v: number) => `${v.toFixed(1)}%`"
        :height="240"
        animate
        @update:brush-range="brushRange = $event"
      />
    </ClientOnly>
  </CardChart>

  <!-- Sled utilization + Storage breakdown -->
  <section class="chart-row">
    <CardChart title="Resource Utilization by Sled" description="Current period average · CPU / Mem / Disk" :index="b + 1">
      <ClientOnly>
        <ChartBar
          v-if="isMounted"
          :groups="sledMultiBarData"
          :format-value="(v: number) => `${v}%`"
          :height="240"
        />
        <BaseSkeleton v-else height="240px" />
      </ClientOnly>
    </CardChart>

    <CardStorageBreakdown :index="b + 1" />
  </section>

  <!-- API request heatmap -->
  <CardChart
    title="API Request Rate"
    description="Requests per hour · last 7 days rolling average"
    :index="b + 2"
  >
    <ClientOnly>
      <ChartHeatmap
        v-if="isMounted"
        :data="heatmapData"
        :height="190"
      />
      <BaseSkeleton v-else height="190px" />
    </ClientOnly>
  </CardChart>
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

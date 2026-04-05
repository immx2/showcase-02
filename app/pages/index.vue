<script setup lang="ts">
import type { Instance } from '~/data/analytics'

const {
  period,
  hasLoaded,
  isLive,
  kpis,
  toggleLive,
  cpuSeries,
  memSeries,
  allCpuSeries,
  allMemSeries,
  sledMultiBarData,
  heatmapData,
} = useDashboard()

const brushRange = ref<[Date, Date] | null>(null)

const brushDescription = computed(() => {
  if (!brushRange.value) return 'Average across all running instances · % used'
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Zoomed: ${fmt(brushRange.value[0])} – ${fmt(brushRange.value[1])} · % used`
})

useHead({ title: 'SaaS Cloud Console' })

const isMounted = useIsMounted()
onMounted(() => { hasLoaded.value = true })

const selectedInstance = ref<Instance | null>(null)

// Global keyboard shortcuts
useEventListener('keydown', (e: KeyboardEvent) => {
  const focused = document.activeElement
  const inInput = focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || (focused as HTMLElement).isContentEditable)
  if (inInput) return

  if (e.key === 'l' || e.key === 'L') {
    toggleLive()
  }
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
  <div class="page">
    <BasePageContent>
      <DashboardHeader
        v-model:period="period"
        :is-live="isLive"
        @toggle-live="toggleLive"
      />

      <!-- KPI row -->
      <section class="kpi-grid" aria-label="Key metrics">
        <CardKpi
          v-for="(kpi, i) in kpis"
          :key="kpi.label"
          :kpi="kpi"
          :index="i"
          :loading="!isMounted"
          :live="isLive"
        />
      </section>

      <!-- CPU + Memory time series -->
      <CardChart
        title="CPU &amp; Memory Utilization"
        :description="brushDescription"
        :index="4"
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

      <!-- Sled + Storage side by side -->
      <section class="chart-row">
        <CardChart title="Resource Utilization by Sled" description="Current period average · CPU / Mem / Disk" :index="5">
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

        <CardStorageBreakdown :index="5" />
      </section>

      <!-- API request heatmap -->
      <CardChart
        title="API Request Rate"
        description="Requests per hour · last 7 days rolling average"
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
    </BasePageContent>

    <AppCommandPalette
      @select-instance="selectedInstance = $event"
      @set-period="period = $event"
      @toggle-live="toggleLive"
    />

    <InstanceDrawer
      :instance="selectedInstance"
      @close="selectedInstance = null"
    />
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* KPI row */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

/* Side-by-side charts */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

/* Responsive — container queries respond to actual content width, not viewport */
@container (width <= 700px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (width <= 560px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@container (width <= 420px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}


</style>

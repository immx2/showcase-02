<script setup lang="ts">
import type { Project } from '~/composables/useDashboard'

const {
  period,
  selectedProject,
  sortKey,
  sortDir,
  isLoading,
  kpis,
  filteredInstances,
  toggleSort,
  cpuSeries,
  memSeries,
  sledBarData,
  storageDonutData,
  heatmapData,
} = useDashboard()

useHead({ title: 'Rack 01 — Oxide Infrastructure Console' })

const projects: { value: Project; label: string }[] = [
  { value: 'all',   label: 'All projects' },
  { value: 'infra', label: 'infra' },
  { value: 'web',   label: 'web' },
  { value: 'data',  label: 'data' },
]

const storageTotal = computed(() => {
  const totalGib = storageDonutData.value.reduce((s, d) => s + d.value, 0)
  return totalGib >= 1024 ? `${(totalGib / 1024).toFixed(1)} TiB` : `${totalGib} GiB`
})
</script>

<template>
  <div class="page">
    <AppNav />

    <main class="dashboard-content">
      <DashboardHeader v-model:period="period" />

      <!-- KPI row -->
      <section class="kpi-grid" aria-label="Key metrics">
        <KpiCard
          v-for="kpi in kpis"
          :key="kpi.label"
          :kpi="kpi"
          :loading="isLoading"
        />
      </section>

      <!-- CPU + Memory time series -->
      <ChartCard
        title="CPU &amp; Memory Utilization"
        description="Average across all running instances · % used"
      >
        <ClientOnly>
          <LineChart
            v-if="!isLoading"
            :data="cpuSeries"
            :data2="memSeries"
            color="var(--chart-1)"
            color2="var(--chart-2)"
            :series-meta="[{ label: 'CPU', color: 'var(--chart-1)' }, { label: 'Mem', color: 'var(--chart-2)' }]"
            :format-value="(v: number) => `${v.toFixed(1)}%`"
            :height="240"
          />
          <SkeletonLoader v-else height="240px" />
        </ClientOnly>
      </ChartCard>

      <!-- Sled + Storage side by side -->
      <section class="chart-row">
        <ChartCard title="CPU Utilization by Sled" description="Current period average · % used">
          <ClientOnly>
            <BarChart
              v-if="!isLoading"
              :data="sledBarData"
              :format-value="(v: number) => `${v}%`"
              :height="240"
            />
            <SkeletonLoader v-else height="240px" />
          </ClientOnly>
        </ChartCard>

        <ChartCard title="Storage Breakdown" :description="`${storageTotal} total allocated`">
          <ClientOnly>
            <DonutChart
              v-if="!isLoading"
              :data="storageDonutData"
              :size="200"
              :format-center="(t: number) => t >= 1024 ? `${(t / 1024).toFixed(0)} TiB` : `${t} GiB`"
            />
            <SkeletonLoader v-else height="240px" />
          </ClientOnly>
        </ChartCard>
      </section>

      <!-- Instance table -->
      <section class="instances-section" aria-labelledby="instances-heading">
        <div class="instances-header">
          <h2 id="instances-heading" class="instances-title">Instances</h2>
          <div class="project-filter" role="group" aria-label="Filter by project">
            <button
              v-for="p in projects"
              :key="p.value"
              :class="{ active: selectedProject === p.value }"
              @click="selectedProject = p.value"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <ClientOnly>
          <InstanceTable
            :instances="filteredInstances"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            @sort="toggleSort"
          />
          <template #fallback>
            <SkeletonLoader height="320px" />
          </template>
        </ClientOnly>
      </section>

      <!-- API request heatmap -->
      <ChartCard
        title="API Request Rate"
        description="Requests per hour · last 7 days rolling average"
      >
        <ClientOnly>
          <HeatmapChart
            v-if="!isLoading"
            :data="heatmapData"
            :height="190"
          />
          <SkeletonLoader v-else height="190px" />
        </ClientOnly>
      </ChartCard>
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* KPI row */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

/* Side-by-side charts */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

/* Instance table section */
.instances-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.instances-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.instances-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Project filter pill */
.project-filter {
  display: flex;
  align-items: center;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.project-filter button {
  height: 100%;
  padding: 0 var(--space-3);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
  white-space: nowrap;
}

.project-filter button + button {
  border-left: 1px solid var(--color-border);
}

.project-filter button.active {
  background: var(--color-active-bg);
  color: var(--color-active-text);
}

.project-filter button:not(.active):hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

/* Responsive */
@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: var(--space-4);
  }

  .kpi-grid,
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>

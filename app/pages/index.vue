<script setup lang="ts">
import type { Project } from '~/composables/useDashboard'
import type { Instance } from '~/data/analytics'

const {
  period,
  selectedProject,
  sortKey,
  sortDir,
  isLoading,
  isLive,
  kpis,
  filteredInstances,
  toggleSort,
  toggleLive,
  cpuSeries,
  memSeries,
  allCpuSeries,
  allMemSeries,
  sledMultiBarData,
  storageDonutData,
  heatmapData,
} = useDashboard()

const brushRange = ref<[Date, Date] | null>(null)

const brushDescription = computed(() => {
  if (!brushRange.value) return 'Average across all running instances · % used'
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Zoomed: ${fmt(brushRange.value[0])} – ${fmt(brushRange.value[1])} · % used`
})

useHead({ title: 'Rack 01 — Oxide Infrastructure Console' })

const selectedInstance = ref<Instance | null>(null)
const instancesView = ref<'table' | 'rack'>('table')

// Global keyboard shortcuts for page-level actions
useEventListener('keydown', (e: KeyboardEvent) => {
  const focused = document.activeElement
  const inInput = focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || (focused as HTMLElement).isContentEditable)
  if (inInput) return

  if (e.key === 'r' || e.key === 'R') {
    instancesView.value = instancesView.value === 'table' ? 'rack' : 'table'
  }
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
      <DashboardHeader
        v-model:period="period"
        :is-live="isLive"
        @toggle-live="toggleLive"
      />

      <!-- KPI row -->
      <section class="kpi-grid" aria-label="Key metrics">
          <DashboardKpiCard
          v-for="kpi in kpis"
          :key="kpi.label"
          :kpi="kpi"
          :loading="isLoading"
          :live="isLive"
        />
      </section>

      <!-- CPU + Memory time series -->
      <ChartCard
        title="CPU &amp; Memory Utilization"
        :description="brushDescription"
      >
        <ClientOnly>
          <ChartLine
            v-if="!isLoading"
            :data="cpuSeries"
            :data2="memSeries"
            :full-data="allCpuSeries"
            :full-data2="allMemSeries"
            color="var(--chart-1)"
            color2="var(--chart-2)"
            :series-meta="[{ label: 'CPU', color: 'var(--chart-1)' }, { label: 'Mem', color: 'var(--chart-2)' }]"
            :format-value="(v: number) => `${v.toFixed(1)}%`"
            :height="240"
            @update:brush-range="brushRange = $event"
          />
          <SkeletonLoader v-else height="240px" />
        </ClientOnly>
      </ChartCard>

      <!-- Sled + Storage side by side -->
      <section class="chart-row">
        <ChartCard title="Resource Utilization by Sled" description="Current period average · CPU / Mem / Disk">
          <ClientOnly>
            <ChartBar
              v-if="!isLoading"
              :groups="sledMultiBarData"
              :format-value="(v: number) => `${v}%`"
              :height="240"
            />
            <SkeletonLoader v-else height="240px" />
          </ClientOnly>
        </ChartCard>

        <ChartCard title="Storage Breakdown" :description="`${storageTotal} total allocated`">
          <ClientOnly>
            <ChartDonut
              v-if="!isLoading"
              :data="storageDonutData"
              :size="200"
              :format-center="(t: number) => t >= 1024 ? `${(t / 1024).toFixed(0)} TiB` : `${t} GiB`"
            />
            <SkeletonLoader v-else height="240px" />
          </ClientOnly>
        </ChartCard>
      </section>

      <!-- Instance table / rack view -->
      <section class="instances-section" aria-labelledby="instances-heading">
        <div class="instances-header">
          <h2 id="instances-heading" class="instances-title">Instances</h2>
          <div class="instances-controls">
            <!-- Project filter (table only) — toggle stays to the right when this hides in rack view -->
            <div
              v-show="instancesView === 'table'"
              class="project-filter"
              role="group"
              aria-label="Filter by project"
            >
              <button
                v-for="p in projects"
                :key="p.value"
                :class="{ active: selectedProject === p.value }"
                @click="selectedProject = p.value"
              >
                {{ p.label }}
              </button>
            </div>

            <div class="view-toggle" role="group" aria-label="View mode">
              <button
                :class="{ active: instancesView === 'table' }"
                :aria-pressed="instancesView === 'table'"
                title="Table view (R)"
                @click="instancesView = 'table'"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="1" y="2" width="10" height="2" rx="0.5" fill="currentColor"/>
                  <rect x="1" y="5" width="10" height="2" rx="0.5" fill="currentColor"/>
                  <rect x="1" y="8" width="10" height="2" rx="0.5" fill="currentColor"/>
                </svg>
                Table
              </button>
              <button
                :class="{ active: instancesView === 'rack' }"
                :aria-pressed="instancesView === 'rack'"
                title="Rack view (R)"
                @click="instancesView = 'rack'"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="10" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
                  <rect x="1" y="7" width="10" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
                  <rect x="2.5" y="2.5" width="2" height="1" rx="0.3" fill="currentColor"/>
                  <rect x="2.5" y="8.5" width="2" height="1" rx="0.3" fill="currentColor"/>
                </svg>
                Rack
              </button>
            </div>
          </div>
        </div>

        <Transition name="view-fade" mode="out-in">
          <div v-if="instancesView === 'table'" key="table">
            <ClientOnly>
              <InstanceTable
                :instances="filteredInstances"
                :sort-key="sortKey"
                :sort-dir="sortDir"
                @sort="toggleSort"
                @select="selectedInstance = $event"
              />
              <template #fallback>
                <SkeletonLoader height="320px" />
              </template>
            </ClientOnly>
          </div>

          <div v-else key="rack">
            <ClientOnly>
              <InstanceRackTopology @select-instance="selectedInstance = $event" />
              <template #fallback>
                <SkeletonLoader height="400px" />
              </template>
            </ClientOnly>
          </div>
        </Transition>
      </section>

      <!-- API request heatmap -->
      <ChartCard
        title="API Request Rate"
        description="Requests per hour · last 7 days rolling average"
      >
        <ClientOnly>
          <ChartHeatmap
            v-if="!isLoading"
            :data="heatmapData"
            :height="190"
          />
          <SkeletonLoader v-else height="190px" />
        </ClientOnly>
      </ChartCard>
    </main>

    <AppCommandPalette
      @select-instance="selectedInstance = $event"
      @set-period="period = $event"
      @toggle-view="instancesView = instancesView === 'table' ? 'rack' : 'table'"
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

.instances-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

/* View toggle (Table / Rack) */
.view-toggle {
  display: flex;
  align-items: center;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-toggle button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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

.view-toggle button + button {
  border-left: 1px solid var(--color-border);
}

.view-toggle button.active {
  background: var(--color-active-bg);
  color: var(--color-active-text);
}

.view-toggle button:not(.active):hover {
  background: var(--color-surface-2);
  color: var(--color-text);
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

/* View transition */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
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

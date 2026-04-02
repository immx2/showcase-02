<script setup lang="ts">
import {
  volumes,
  storageBreakdown,
  storageHistory,
  storageKpiSparklines,
  type Volume,
} from '~/data/analytics'
import type { Kpi } from '~/composables/useDashboard'

useHead({ title: 'Storage — SaaS Cloud Console' })

const { selectedProject, sortKey, sortDir, filteredVolumes, toggleSort } = useStorage()

const selectedVolume = ref<Volume | null>(null)

// ── KPI computed values ──────────────────────────────────────────────────

const totalCapacityGib = volumes.reduce((s, v) => s + v.sizeGib, 0)
const totalUsedGib     = volumes.reduce((s, v) => s + v.usedGib, 0)
const usedPct          = totalCapacityGib > 0 ? (totalUsedGib / totalCapacityGib) * 100 : 0
const prevCapacityGib  = totalCapacityGib - 4096  // vol-ml-training-set added recently
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

// ── Chart data ───────────────────────────────────────────────────────────

const donutData = storageBreakdown.map(s => ({ label: s.label, value: s.gib, color: s.color }))

const storageTotalLabel = computed(() => {
  const t = totalCapacityGib
  return t >= 1024 ? `${(t / 1024).toFixed(1)} TiB total allocated` : `${t} GiB total allocated`
})

const storageLineSeries = storageHistory.map(s => ({ date: s.date, value: s.totalGib }))

// ── Mount guard for ClientOnly ────────────────────────────────────────────

const isMounted = ref(false)
onMounted(() => { isMounted.value = true })
</script>

<template>
  <div class="page">
    <main class="storage-content">

      <!-- Header -->
      <div class="storage-header">
        <h1 class="page-title">Storage</h1>
      </div>

      <!-- KPI row -->
      <section class="kpi-grid" aria-label="Storage metrics">
        <DashboardKpiCard
          v-for="(kpi, i) in storageKpis"
          :key="kpi.label"
          :kpi="kpi"
          :index="i"
          :loading="!isMounted"
        />
      </section>

      <!-- Charts row -->
      <section class="chart-row">
        <ChartCard title="Storage Breakdown" :description="storageTotalLabel">
          <ClientOnly>
            <ChartDonut
              v-if="isMounted"
              :data="donutData"
              :size="200"
              :format-center="(t: number) => t >= 1024 ? `${(t / 1024).toFixed(0)} TiB` : `${t} GiB`"
            />
            <SkeletonLoader v-else height="240px" />
          </ClientOnly>
        </ChartCard>

        <ChartCard title="Capacity Growth" description="Total allocated storage · TiB">
          <ClientOnly>
            <ChartLine
              v-if="isMounted"
              :data="storageLineSeries"
              color="var(--chart-3)"
              :format-value="(v: number) => `${(v / 1024).toFixed(1)} TiB`"
              :height="240"
              :margin-left="62"
            />
            <SkeletonLoader v-else height="240px" />
          </ClientOnly>
        </ChartCard>
      </section>

      <!-- Volumes table -->
      <section class="volumes-section">
        <div class="section-header">
          <h2 class="section-title">Volumes</h2>
          <span class="section-count">{{ filteredVolumes.length }}</span>
          <div class="filter-group" role="group" aria-label="Filter by project">
            <button
              v-for="proj in (['all', 'infra', 'web', 'data'] as const)"
              :key="proj"
              class="filter-btn"
              :class="{ active: selectedProject === proj }"
              @click="selectedProject = proj"
            >
              {{ proj }}
            </button>
          </div>
        </div>
        <StorageTable
          :volumes="filteredVolumes"
          :sort-key="sortKey"
          :sort-dir="sortDir"
          @sort="toggleSort"
          @select="selectedVolume = $event"
        />
      </section>

    </main>

    <StorageDrawer
      :volume="selectedVolume"
      @close="selectedVolume = null"
    />
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.storage-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  container-type: inline-size;
}

/* Header */
.storage-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

/* KPI grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

/* Charts row */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

/* Volumes section */
.volumes-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.filter-group {
  display: flex;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-left: auto;
}

.filter-btn {
  padding: 0 var(--space-3);
  border: none;
  border-right: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.filter-btn:last-child { border-right: none; }

.filter-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.filter-btn.active {
  background: var(--color-active-bg);
  color: var(--color-active-text);
}

.section-count {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
}

/* Responsive */
@container (width <= 880px) {
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

@media (width <= 768px) {
  .storage-content {
    padding: var(--space-4);
  }
}
</style>

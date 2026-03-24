<script setup lang="ts">
const {
  period,
  isLoading,
  filteredMetrics,
  kpis,
  trafficSources,
  planRevenue,
  heatmapData,
} = useDashboard()

useHead({ title: 'Pulse Analytics — Dashboard' })

const revenueChartData = computed(() =>
  filteredMetrics.value.map(d => ({ date: d.date, value: d.revenue })),
)

const barData = computed(() =>
  planRevenue.map(p => ({ label: p.plan, value: p.mrr, color: p.color })),
)

const donutData = computed(() =>
  trafficSources.map(s => ({ label: s.source, value: s.sessions, color: s.color })),
)
</script>

<template>
  <div class="page">
    <AppNav />

    <main class="dashboard-content">
      <DashboardHeader v-model:period="period" />

      <section class="kpi-grid" aria-label="Key metrics">
        <KpiCard
          v-for="kpi in kpis"
          :key="kpi.label"
          :kpi="kpi"
          :loading="isLoading"
        />
      </section>

      <section class="chart-grid">
        <ChartCard
          title="Revenue Over Time"
          description="Daily revenue for the selected period"
          class="span-full"
        >
          <ClientOnly>
            <LineChart
              v-if="!isLoading"
              :data="revenueChartData"
              color="var(--chart-1)"
              :format-value="(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`"
            />
            <SkeletonLoader v-else height="260px" />
          </ClientOnly>
        </ChartCard>

        <ChartCard title="Revenue by Plan" description="Monthly recurring revenue breakdown">
          <ClientOnly>
            <BarChart
              v-if="!isLoading"
              :data="barData"
            />
            <SkeletonLoader v-else height="260px" />
          </ClientOnly>
        </ChartCard>

        <ChartCard title="Traffic Sources" description="Session distribution by channel">
          <ClientOnly>
            <DonutChart
              v-if="!isLoading"
              :data="donutData"
              :format-center="(t: number) => t >= 1000 ? `${(t / 1000).toFixed(1)}k` : String(t)"
            />
            <SkeletonLoader v-else height="260px" />
          </ClientOnly>
        </ChartCard>

        <ChartCard title="Activity Heatmap" description="Sessions by day and hour" class="span-full">
          <ClientOnly>
            <HeatmapChart
              v-if="!isLoading"
              :data="heatmapData"
            />
            <SkeletonLoader v-else height="200px" />
          </ClientOnly>
        </ChartCard>
      </section>
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
  padding: var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.chart-grid .span-full {
  grid-column: 1 / -1;
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: var(--space-4);
  }

  .kpi-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .chart-grid .span-full {
    grid-column: 1;
  }
}
</style>

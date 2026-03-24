<script setup lang="ts">
import type { Kpi } from '~/composables/useDashboard'
import { useAnimatedCounter } from '~/composables/useAnimatedCounter'

const props = defineProps<{
  kpi: Kpi
  loading?: boolean
}>()

const target = computed(() => props.kpi.value)
const animated = useAnimatedCounter(target)

const formattedValue = computed(() => {
  const v = animated.value
  if (props.kpi.format === 'currency') {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
    return `$${Math.round(v)}`
  }
  if (props.kpi.format === 'percent') return `${v.toFixed(2)}%`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return Math.round(v).toLocaleString()
})

const trendFormatted = computed(() => {
  const t = props.kpi.trend
  return `${t >= 0 ? '+' : ''}${t.toFixed(1)}%`
})

const isPositive = computed(() => {
  if (props.kpi.label === 'Churn Rate') return props.kpi.trend <= 0
  return props.kpi.trend >= 0
})
</script>

<template>
  <div class="kpi-card" :class="{ loading }">
    <div v-if="loading" class="kpi-skeleton">
      <div class="skel-line skel-label" />
      <div class="skel-line skel-value" />
      <div class="skel-line skel-spark" />
    </div>
    <template v-else>
      <div class="kpi-top">
        <span class="kpi-label">{{ kpi.label }}</span>
        <span class="kpi-trend" :class="isPositive ? 'positive' : 'negative'">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path
              v-if="isPositive"
              d="M5 2L8.5 6.5H1.5L5 2Z"
              fill="currentColor"
            />
            <path
              v-else
              d="M5 8L1.5 3.5H8.5L5 8Z"
              fill="currentColor"
            />
          </svg>
          {{ trendFormatted }}
        </span>
      </div>
      <div class="kpi-value">{{ formattedValue }}</div>
      <SparklineChart
        :data="kpi.sparkline"
        :color="isPositive ? 'var(--color-positive)' : 'var(--color-negative)'"
        :width="140"
        :height="28"
      />
    </template>
  </div>
</template>

<style scoped>
.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: border-color var(--duration-base);
}

.kpi-card:hover {
  border-color: var(--color-border);
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
}

.kpi-trend.positive { color: var(--color-positive); }
.kpi-trend.negative { color: var(--color-negative); }

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

/* Skeleton */
.kpi-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skel-line {
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  animation: pulse 1.4s ease-in-out infinite;
}

.skel-label { width: 60%; height: 12px; }
.skel-value { width: 45%; height: 24px; }
.skel-spark { width: 100%; height: 28px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>

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
  switch (props.kpi.format) {
    case 'percent':
      return `${v.toFixed(1)}%`
    case 'throughput':
      return `${v.toFixed(2)} ${props.kpi.unit ?? ''}`
    case 'bytes':
      if (v >= 1024) return `${(v / 1024).toFixed(1)} TiB`
      return `${Math.round(v)} GiB`
    case 'number':
    default:
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
      if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
      return Math.round(v).toString()
  }
})

const trendFormatted = computed(() => {
  const t = props.kpi.trend
  return `${t >= 0 ? '+' : ''}${t.toFixed(1)}%`
})

const isPositive = computed(() =>
  props.kpi.trendPositiveWhenDown ? props.kpi.trend <= 0 : props.kpi.trend >= 0,
)
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
        <span class="kpi-label text-mono-label">{{ kpi.label }}</span>
        <span class="kpi-trend" :class="isPositive ? 'positive' : 'negative'">
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
            <path v-if="isPositive" d="M4 1L7 6H1L4 1Z" fill="currentColor" />
            <path v-else            d="M4 7L1 2H7L4 7Z" fill="currentColor" />
          </svg>
          {{ trendFormatted }}
        </span>
      </div>
      <div class="kpi-value">{{ formattedValue }}</div>
      <ChartSparkline
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
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
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
  color: var(--color-text-muted);
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
}

.kpi-trend.positive { color: var(--color-positive); }
.kpi-trend.negative { color: var(--color-negative); }

.kpi-value {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.01em;
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

.skel-label { width: 60%; height: var(--text-xs); }
.skel-value { width: 45%; height: 22px; }
.skel-spark { width: 100%; height: 28px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>

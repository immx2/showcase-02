<script setup lang="ts">
import type { Kpi } from '~/composables/useDashboard'
import { useAnimatedCounter } from '~/composables/useAnimatedCounter'

const props = withDefaults(defineProps<{
  kpi?: Kpi
  /** When true (live mode), numeric display snaps without RAF animation. */
  live?: boolean
}>(), {
  kpi: undefined,
  live: false,
})

const target = computed(() => props.kpi?.value ?? 0)
const snap = toRef(props, 'live')
const animated = useAnimatedCounter(target, 600, snap)

const formattedValue = computed(() => {
  const v = animated.value
  switch (props.kpi!.format) {
    case 'percent':     return formatPercent(v)
    case 'throughput':  return formatThroughput(v, props.kpi!.unit ?? '')
    case 'bytes':       return formatGib(v)
    case 'number':
    default:            return formatNumber(v)
  }
})

const trendFormatted = computed(() => {
  const t = props.kpi!.trend
  return `${Math.abs(t).toFixed(1)}%`
})

const isPositive = computed(() =>
  props.kpi!.trendPositiveWhenDown ? props.kpi!.trend <= 0 : props.kpi!.trend >= 0,
)
</script>

<template>
  <BaseCard>
    <MountSwap>
      <template #skeleton>
        <div class="kpi-skeleton">
          <div class="skel-line skel-label" />
          <div class="skel-line skel-value" />
          <div class="skel-line skel-spark" />
        </div>
      </template>

      <div class="kpi-content">
        <div class="kpi-top">
          <span class="kpi-label text-mono-label">{{ kpi!.label }}</span>
          <span class="kpi-trend" :class="isPositive ? 'positive' : 'negative'">
            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
              <path v-if="isPositive" d="M4 1L7 6H1L4 1Z" fill="currentColor" />
              <path v-else            d="M4 7L1 2H7L4 7Z" fill="currentColor" />
            </svg>
            {{ trendFormatted }}
          </span>
        </div>
        <div class="kpi-bottom">
          <div class="kpi-value">{{ formattedValue }}</div>
          <ChartSparkline
            :data="kpi!.sparkline"
            :color="isPositive ? 'var(--color-positive)' : 'var(--color-negative)'"
            :height="28"
            :animate="true"
          />
        </div>
      </div>
    </MountSwap>
  </BaseCard>
</template>

<style scoped>
.kpi-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.kpi-bottom {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: auto;
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
  animation: pulse var(--motion-pulse-ui);
}

.skel-label { width: 60%; height: var(--text-xs); }
.skel-value { width: 45%; height: 22px; }
.skel-spark { width: 100%; height: 28px; }

</style>

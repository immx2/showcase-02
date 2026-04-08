<script setup lang="ts">
const props = defineProps<{
  show: boolean
  x: number
  y: number
}>()

const tooltipRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(tooltipRef)
const half = computed(() => Math.ceil(width.value / 2) || 72)
</script>

<template>
  <BaseTooltip>
      <div
        v-if="props.show"
        ref="tooltipRef"
        class="chart-tooltip ui-surface"
        :style="{
          left: `clamp(${half}px, ${x}px, calc(100vw - ${half}px))`,
          top: `${y}px`,
        }"
      >
        <slot />
      </div>
  </BaseTooltip>
</template>

<style scoped>
.chart-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  pointer-events: none;
  box-shadow: var(--shadow-md);
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: var(--space-2) var(--space-3);
  gap: var(--space-1);
}

</style>

<style>
/* Shared slot styles — available to all ChartTooltip consumers */
.chart-tooltip .tt-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chart-tooltip .tt-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chart-tooltip .tt-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.chart-tooltip .tt-value {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.chart-tooltip .tt-muted {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.chart-tooltip .tt-sep { color: var(--color-text-muted); }
</style>

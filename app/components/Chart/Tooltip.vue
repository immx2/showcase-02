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
</template>

<style scoped>
.chart-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  pointer-events: none;
  box-shadow: var(--shadow-md);
  z-index: 10;
}
</style>

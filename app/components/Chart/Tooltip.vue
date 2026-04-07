<script setup lang="ts">
defineProps<{
  show: boolean
  x: number
  y: number
}>()
</script>

<template>
  <div
    v-if="show"
    class="chart-tooltip ui-surface"
    :style="{
      left: `clamp(72px, ${x}px, calc(100% - 72px))`,
      top: `${y}px`,
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.chart-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: none;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
  z-index: 10;
}
</style>

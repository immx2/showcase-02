<script setup lang="ts">
const { state } = useTooltip()
const isText = computed(() => typeof state.content === 'string')

const tooltipRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(tooltipRef)
const half = computed(() => Math.ceil(width.value / 2) || 72)

const pos = computed(() => ({
  left: `clamp(${half.value}px, ${state.x}px, calc(100vw - ${half.value}px))`,
  top: `${state.y}px`,
}))
</script>

<template>
  <BaseTooltip>
    <div
      v-if="state.show"
      ref="tooltipRef"
      class="app-tooltip ui-surface"
      :class="isText ? 'tt-text' : 'tt-rich'"
      :style="pos"
      role="tooltip"
    >
      <template v-if="isText">{{ state.content }}</template>
      <component :is="(state.content as any).is" v-else v-bind="(state.content as any).props" />
    </div>
  </BaseTooltip>
</template>

<style scoped>
.app-tooltip {
  position: fixed;
  transform: translate(-50%, calc(-100% - 6px));
  pointer-events: none;
  z-index: 8000;
}
</style>

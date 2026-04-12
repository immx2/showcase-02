<script setup lang="ts">
const { state } = useTooltip()
const isText = computed(() => typeof state.content === 'string')

const GAP = 6 // px between tooltip edge and trigger element

const tooltipRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(tooltipRef)

// Clamp horizontally so the tooltip never bleeds past either viewport edge.
// Falls back to 72px half-width on first render before the element is measured.
const halfWidth = computed(() => Math.ceil(width.value / 2) || 72)

// Flip to below the trigger when it sits in the top quarter of the viewport,
// where showing above would risk clipping outside the visible area.
const flipped = computed(() => state.yTop < window.innerHeight * 0.25)

const pos = computed(() => ({
  left: `clamp(${halfWidth.value}px, ${state.x}px, calc(100vw - ${halfWidth.value}px))`,
  // Anchor to the trigger's bottom edge when flipped, top edge otherwise.
  top: flipped.value ? `${state.yBottom}px` : `${state.yTop}px`,
  // Offset away from the trigger by GAP in whichever direction we're opening.
  transform: flipped.value
    ? `translate(-50%, ${GAP}px)`
    : `translate(-50%, calc(-100% - ${GAP}px))`,
}))
</script>

<template>
  <Teleport to="body">
    <Transition name="tt">
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
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-tooltip {
  position: fixed;
  width: max-content;
  pointer-events: none;
  z-index: var(--z-tooltip);
}
</style>

<script setup lang="ts">
const { state } = useTooltip()
const isText = computed(() => typeof state.content === 'string')
const pos = computed(() => ({
  left: `${state.x}px`,
  top: `${state.y}px`,
}))
</script>

<template>
  <Teleport to="body">
    <Transition name="tt">
      <div
        v-if="state.show"
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
  transform: translate(-50%, calc(-100% - 6px));
  pointer-events: none;
  z-index: 8000;
}

.tt-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  white-space: nowrap;
}

.tt-rich {
  padding: var(--space-3);
  min-width: 180px;
  box-shadow: var(--shadow-md);
}

.tt-enter-active,
.tt-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.tt-enter-from,
.tt-leave-to {
  opacity: 0;
}
</style>

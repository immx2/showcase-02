<script setup lang="ts">
const props = defineProps<{
  open: boolean
  label?: string
}>()

const emit = defineEmits<{ close: [] }>()

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
})
</script>

<template>
  <Teleport to="body">
    <BaseScrim :open="open" @close="emit('close')" />
    <Transition name="drawer">
      <aside
        v-if="open"
        class="drawer"
        role="complementary"
        :aria-label="label"
      >
        <slot />
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer {
  position: fixed;
  top: var(--portfolio-nav-height, 32px);
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  z-index: var(--z-panel);
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
</style>

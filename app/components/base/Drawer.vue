<script setup lang="ts">
const props = defineProps<{
  open: boolean
  label?: string
}>()

const emit = defineEmits<{ close: [] }>()

/** Keep in sync with `assets/styles/_tokens.css` (`--duration-base`). */
const drawerTransitionMs = 180

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer" :duration="drawerTransitionMs">
      <div v-if="open" class="drawer-wrap">
        <div class="drawer-scrim" aria-hidden="true" @click="emit('close')" />
        <aside
          class="drawer"
          role="complementary"
          :aria-label="label"
        >
          <slot />
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-wrap {
  position: fixed;
  inset: 0;
  top: var(--portfolio-nav-height, 32px);
  z-index: 7000;
  pointer-events: none;
}

.drawer-scrim {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 35%);
  pointer-events: auto;
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
}

/* Transition: scrim fades, drawer slides from right */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform var(--duration-base) var(--ease-out);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}
</style>

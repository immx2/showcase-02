<script setup lang="ts">
defineProps<{
  open: boolean
  blur?: boolean
  z?: string
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="scrim">
      <div
        v-if="open"
        class="scrim"
        :class="{ 'scrim-blur': blur }"
        :style="z !== undefined ? { '--scrim-z': z } : undefined"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  top: var(--portfolio-nav-height, 32px);
  z-index: var(--scrim-z, var(--z-scrim));
  background: var(--color-scrim);
}

.scrim-blur {
  backdrop-filter: blur(2px);
}
</style>

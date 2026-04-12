<script setup lang="ts">
withDefaults(defineProps<{
  width?: string
  height?: string
  radius?: string
}>(), {
  width: '100%',
  height: '200px',
  radius: 'var(--radius-md)',
})
</script>

<template>
  <div
    class="skeleton"
    :style="{ width, height, borderRadius: radius }"
  />
</template>

<style scoped>
.skeleton {
  background: var(--color-surface-2);
  animation: pulse var(--motion-pulse-ui);
}

</style>

<script setup lang="ts">
const props = defineProps<{
  index?: number
}>()

const style = computed(() =>
  props.index !== undefined ? { '--stagger-index': props.index } : undefined
)
</script>

<template>
  <div class="base-card card-enter" :style="style">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-shadow: var(--shadow-sm);
}
</style>

<script setup lang="ts">
const props = defineProps<{
  index?: number
}>()

const style = computed(() =>
  props.index !== undefined ? { '--stagger-index': props.index } : undefined
)
</script>

<template>
  <div class="base-card" :style="style">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: border-color var(--duration-base);
  animation: card-enter 0.4s var(--ease-out) backwards;
  animation-delay: calc(var(--stagger-index, 0) * 80ms);
  box-shadow: 0 0 5px 0 rgb(0 0 0 / 5%);
}

.base-card:hover {
  border-color: var(--color-border);
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

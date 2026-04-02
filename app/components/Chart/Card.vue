<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  index?: number
}>()

const style = computed(() =>
  props.index !== undefined ? { '--stagger-index': props.index } : undefined
)
</script>

<template>
  <div class="chart-card" :style="style">
    <div class="chart-card-header">
      <h3 class="chart-card-title">{{ title }}</h3>
      <span v-if="description" class="chart-card-desc">{{ description }}</span>
    </div>
    <div class="chart-card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: border-color var(--duration-base);
  min-width: 0;
  animation: chart-enter 0.4s var(--ease-out) backwards;
  animation-delay: calc(var(--stagger-index, 0) * 80ms);
}

@keyframes chart-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.chart-card:hover {
  border-color: var(--color-border);
}

.chart-card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.chart-card-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.chart-card-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.chart-card-body {
  flex: 1;
  min-height: 0;
}
</style>

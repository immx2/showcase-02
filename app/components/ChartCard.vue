<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="chart-card">
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
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: border-color var(--duration-base);
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
  font-size: 14px;
  font-weight: 600;
}

.chart-card-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

.chart-card-body {
  flex: 1;
  min-height: 0;
}
</style>

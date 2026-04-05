<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  index?: number
}>()
</script>

<template>
  <BaseCard :index="index">
    <div class="chart-card-inner">
      <div class="chart-card-header">
        <h3 class="chart-card-title">{{ title }}</h3>
        <span v-if="description" class="chart-card-desc">{{ description }}</span>
      </div>
      <div class="chart-card-body">
        <slot />
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.chart-card-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
  min-height: 0;
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

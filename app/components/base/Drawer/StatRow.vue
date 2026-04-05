<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="stat-row-wrap">
    <div v-if="title" class="section-heading">{{ title }}</div>
    <div class="stat-row">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.stat-row-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.section-heading {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-4);
  background: var(--color-table-row);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.stat-row :deep(.sparkline-block) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-row :deep(.spark-label) {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.stat-row :deep(.spark-value) {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.stat-row :deep(.stat-divider) {
  width: 1px;
  height: 48px;
  background: var(--color-border);
  flex-shrink: 0;
}
</style>

<script setup lang="ts">
defineProps<{
  title: string
  count?: number
}>()
</script>

<template>
  <div class="section-header">
    <h2 class="section-title">{{ title }}</h2>
    <span v-if="count !== undefined" class="section-count">{{ count }}</span>
    <div v-if="$slots.default" class="section-header-controls">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.section-count {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
}

.section-header-controls {
  margin-left: auto;
}
</style>

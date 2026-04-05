<template>
  <dl class="meta-grid">
    <slot />
  </dl>
</template>

<style scoped>
.meta-grid {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-table-row);
}

.meta-grid :deep(.meta-row) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.meta-grid :deep(.meta-row:last-child) {
  border-bottom: none;
}

.meta-grid :deep(dt) {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 500;
}

.meta-grid :deep(dd) {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text);
  text-align: right;
}
</style>

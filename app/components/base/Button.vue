<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'danger'
}>()
</script>

<template>
  <button class="action-btn ui-surface" :class="variant">
    <slot />
  </button>
</template>

<style scoped>
.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 30px;
  padding: 0 var(--space-3);
  background: transparent;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-surface-2);
}

.action-btn.primary {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.action-btn.primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.action-btn.danger {
  border-color: var(--color-status-faulted);
  color: var(--color-status-faulted);
}

.action-btn.danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-status-faulted) 10%, transparent);
}
</style>

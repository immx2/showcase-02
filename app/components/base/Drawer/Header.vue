<script setup lang="ts">
import type { InstanceState } from '~/data/analytics'

defineProps<{
  title: string
  status: InstanceState
  project: string
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="drawer-header">
    <div class="drawer-title-row">
      <StatusBadge :status="status" />
      <h2 class="drawer-title">{{ title }}</h2>
    </div>
    <div class="drawer-header-meta">
      <span class="project-tag" :class="project">{{ project }}</span>
      <button class="close-btn" aria-label="Close drawer" @click="emit('close')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.drawer-header {
  flex-shrink: 0;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  background: var(--color-surface);
}

.drawer-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.drawer-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-header-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-tag {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.project-tag.infra { color: var(--chart-1); }
.project-tag.web   { color: var(--chart-2); }
.project-tag.data  { color: var(--chart-3); }

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.close-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
  border-color: var(--color-border);
}
</style>

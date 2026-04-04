<script setup lang="ts">
import type { Project } from '~/composables/useDashboard'

const model = defineModel<Project>({ default: 'all' })

const options: { value: Project; label: string }[] = [
  { value: 'all',   label: 'all projects' },
  { value: 'infra', label: 'infra' },
  { value: 'web',   label: 'web' },
  { value: 'data',  label: 'data' },
]
</script>

<template>
  <div class="project-filter" role="group" aria-label="Filter by project">
    <button
      v-for="opt in options"
      :key="opt.value"
      :class="{ active: model === opt.value }"
      @click="model = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.project-filter {
  display: flex;
  align-items: center;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-2);
  overflow: hidden;
}

.project-filter button {
  height: 100%;
  padding: 0 var(--space-3);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
  white-space: nowrap;
}

.project-filter button + button {
  border-left: 1px solid var(--color-border);
}

.project-filter button.active {
  background: var(--color-surface);
  color: var(--color-active-text);
}

.project-filter button:not(.active):hover {
  background: var(--color-table-row);
  color: var(--color-text);
}
</style>

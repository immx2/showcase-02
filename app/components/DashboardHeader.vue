<script setup lang="ts">
import type { Period } from '~/composables/useDashboard'

const props = defineProps<{
  period: Period
}>()

const emit = defineEmits<{
  'update:period': [value: Period]
}>()

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: '7 D' },
  { value: '30d', label: '30 D' },
  { value: '90d', label: '90 D' },
  { value: '12m', label: '12 M' },
]
</script>

<template>
  <header class="dash-header">
    <div>
      <h1 class="dash-title">Analytics</h1>
      <p class="dash-subtitle">Pulse SaaS — key metrics and performance overview</p>
    </div>

    <div class="period-pill" role="group" aria-label="Time period">
      <button
        v-for="p in periods"
        :key="p.value"
        :class="{ active: period === p.value }"
        @click="emit('update:period', p.value)"
      >
        {{ p.label }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.dash-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.dash-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.dash-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.period-pill {
  display: flex;
  align-items: center;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.period-pill button {
  height: 100%;
  padding: 0 var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.period-pill button + button {
  border-left: 1px solid var(--color-border);
}

.period-pill button.active {
  background: var(--color-active-bg);
  color: var(--color-active-text);
}

.period-pill button:not(.active):hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}
</style>

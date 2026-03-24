<script setup lang="ts">
import type { Period } from '~/composables/useDashboard'

defineProps<{
  period: Period
}>()

const emit = defineEmits<{
  'update:period': [value: Period]
}>()

const periods: { value: Period; label: string }[] = [
  { value: '7d',  label: '7 D'  },
  { value: '30d', label: '30 D' },
  { value: '90d', label: '90 D' },
]
</script>

<template>
  <header class="dash-header">
    <div>
      <h1 class="dash-title">System Overview</h1>
      <p class="dash-subtitle">Rack 01 — 6 sleds · 24 instances · Updated just now</p>
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
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.dash-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  margin-top: var(--space-1);
}

.period-pill {
  display: flex;
  align-items: center;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.period-pill button {
  height: 100%;
  padding: 0 var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-mono);
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

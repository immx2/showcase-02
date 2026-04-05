<script setup lang="ts">
import type { Period } from '~/composables/useDashboard'

defineProps<{
  period: Period
  isLive: boolean
}>()

const emit = defineEmits<{
  'update:period': [value: Period]
  'toggle-live': []
}>()

const periods: { value: Period; label: string }[] = [
  { value: '7d',  label: '7 D'  },
  { value: '30d', label: '30 D' },
  { value: '90d', label: '90 D' },
]
</script>

<template>
  <BasePageHeader title="System Overview">
    <template #subtitle>
      <p class="dash-subtitle">
        Rack 01 — 6 sleds · 24 instances ·
        <span v-if="isLive" class="live-indicator" aria-live="polite">
          <span class="live-dot" aria-hidden="true" />
          Streaming live
        </span>
        <span v-else>Updated just now</span>
      </p>
    </template>

    <button
      :class="['live-btn', { active: isLive }]"
      :aria-pressed="isLive"
      title="Toggle live mode (L)"
      @click="emit('toggle-live')"
    >
      <span class="live-btn-dot" aria-hidden="true" />
      {{ isLive ? 'Live' : 'Live' }}
      <kbd class="btn-kbd">L</kbd>
    </button>

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
  </BasePageHeader>
</template>

<style scoped>
.dash-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-status-running);
}

.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-status-running);
  animation: live-pulse 1.5s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.75); }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Live button */
.live-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 30px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast);
  box-shadow: var(--shadow-sm);
}

.live-btn:hover {
  background: var(--color-table-row);
  color: var(--color-text);
}

.live-btn.active {
  border-color: var(--color-status-running);
  color: var(--color-status-running);
  background: color-mix(in oklch, var(--color-status-running) 8%, transparent);
}

.live-btn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentcolor;
  flex-shrink: 0;
  transition: background var(--duration-fast);
}

.live-btn.active .live-btn-dot {
  animation: live-pulse 1.5s ease-in-out infinite;
}

.btn-kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 4px;
  border: 1px solid currentcolor;
  border-radius: 3px;
  opacity: 0.6;
  line-height: 1.4;
}

/* Period pill */
.period-pill {
  display: flex;
  align-items: center;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.period-pill button {
  height: 100%;
  padding: 0 var(--space-4);
  border: none;
  background-color: var(--color-surface-2);
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
  background: var(--color-surface);
  color: var(--color-active-text);
}

.period-pill button:not(.active):hover {
  background: var(--color-table-row);
  color: var(--color-text);
}
</style>

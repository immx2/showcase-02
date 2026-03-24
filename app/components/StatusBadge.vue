<script setup lang="ts">
import type { InstanceState } from '~/data/analytics'

defineProps<{
  status: InstanceState
}>()
</script>

<template>
  <span class="badge text-mono-label" :class="status" :aria-label="`State: ${status}`">
    <span class="dot" aria-hidden="true" />
    {{ status }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* State-specific colors */
.running  { color: var(--color-status-running); }
.starting { color: var(--color-status-starting); }
.stopped  { color: var(--color-status-stopped); }
.faulted  { color: var(--color-status-faulted); }

.running  .dot { background: var(--color-status-running); animation: pulse-dot 2s ease-in-out infinite; }
.starting .dot { background: var(--color-status-starting); animation: pulse-dot 1.2s ease-in-out infinite; }
.stopped  .dot { background: var(--color-status-stopped); }
.faulted  .dot { background: var(--color-status-faulted); }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.75); }
}
</style>

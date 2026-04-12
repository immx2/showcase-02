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

.running  .dot { background: var(--color-status-running); animation: pulse-dot var(--motion-pulse-idle); }
.starting .dot { background: var(--color-status-starting); animation: pulse-dot var(--motion-pulse-starting); }
.stopped  .dot { background: var(--color-status-stopped); }
.faulted  .dot { background: var(--color-status-faulted); }

</style>

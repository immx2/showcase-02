<script setup lang="ts">
defineProps<{
  events: { level: 'info' | 'warning' | 'error', message: string, time: string }[]
  title?: string
}>()
</script>

<template>
  <div class="event-log">
    <div class="section-heading">{{ title ?? 'Event log' }}</div>
    <div class="log-list">
      <div
        v-for="(ev, i) in events"
        :key="i"
        :class="['log-row', ev.level]"
      >
        <span class="log-dot" aria-hidden="true" />
        <span class="log-msg">{{ ev.message }}</span>
        <span class="log-time">{{ ev.time }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-log {
  display: flex;
  flex-direction: column;
}

.section-heading {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-table-row);
}

.log-row {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: var(--text-xs);
}

.log-row:last-child { border-bottom: none; }

.log-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.log-row.info    .log-dot { background: var(--color-accent); }
.log-row.warning .log-dot { background: var(--color-status-starting); }
.log-row.error   .log-dot { background: var(--color-status-faulted); }

.log-msg {
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.4;
}

.log-row.warning .log-msg { color: var(--color-status-starting); }
.log-row.error   .log-msg { color: var(--color-status-faulted); }

.log-time {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>

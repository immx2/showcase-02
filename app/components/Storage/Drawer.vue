<script setup lang="ts">
import type { Volume, InstanceState } from '~/data/analytics'

const props = defineProps<{
  volume: Volume | null
}>()

const emit = defineEmits<{ close: [] }>()

function stateToStatus(state: Volume['state']): InstanceState {
  if (state === 'attached')  return 'running'
  if (state === 'creating')  return 'starting'
  if (state === 'faulted')   return 'faulted'
  return 'stopped'
}

function formatGib(gib: number): string {
  return gib >= 1024 ? `${(gib / 1024).toFixed(1)} TiB` : `${gib} GiB`
}

function usedPct(v: Volume): string {
  if (v.sizeGib === 0 || v.usedGib === 0) return '—'
  return `${Math.round((v.usedGib / v.sizeGib) * 100)}%`
}

interface LogEntry {
  level: 'info' | 'warning' | 'error'
  msg: string
  time: string
}

const events = computed<LogEntry[]>(() => {
  const v = props.volume
  if (!v) return []
  if (v.state === 'faulted') {
    return [
      { level: 'error',   msg: 'I/O error — volume marked faulted',    time: '2d ago' },
      { level: 'warning', msg: 'Elevated write latency detected',       time: '3d ago' },
      { level: 'info',    msg: 'Volume created',                        time: v.created },
    ]
  }
  if (v.state === 'attached') {
    return [
      { level: 'info', msg: `Attached to ${v.attachedInstance}`,        time: '—' },
      { level: 'info', msg: `Snapshot ${v.name}.snap-02 created`,       time: '3d ago' },
      { level: 'info', msg: `Snapshot ${v.name}.snap-01 created`,       time: '14d ago' },
      { level: 'info', msg: 'Volume created',                           time: v.created },
    ]
  }
  return [
    { level: 'info', msg: 'Detached from previous instance', time: '—' },
    { level: 'info', msg: 'Volume created',                  time: v.created },
  ]
})
</script>

<template>
  <AppDrawer
    :open="!!volume"
    :label="volume ? `Volume: ${volume.name}` : ''"
    @close="emit('close')"
  >
    <template v-if="volume">
      <!-- Header -->
      <div class="drawer-header">
        <div class="drawer-title-row">
          <StatusBadge :status="stateToStatus(volume.state)" />
          <h2 class="drawer-title">{{ volume.name }}</h2>
        </div>
        <div class="drawer-header-meta">
          <span class="project-tag" :class="volume.project">{{ volume.project }}</span>
          <button class="close-btn" aria-label="Close drawer" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="drawer-body">
        <!-- Metadata -->
        <dl class="meta-grid">
          <div class="meta-row">
            <dt>Type</dt>
            <dd>{{ volume.type }}</dd>
          </div>
          <div class="meta-row">
            <dt>Size</dt>
            <dd>{{ formatGib(volume.sizeGib) }}</dd>
          </div>
          <div class="meta-row">
            <dt>Used</dt>
            <dd>
              {{ volume.usedGib > 0 ? formatGib(volume.usedGib) : '—' }}
              <span v-if="volume.usedGib > 0" class="meta-pct">({{ usedPct(volume) }})</span>
            </dd>
          </div>
          <div class="meta-row">
            <dt>Attached to</dt>
            <dd>{{ volume.attachedInstance ?? '—' }}</dd>
          </div>
          <div class="meta-row">
            <dt>Project</dt>
            <dd>{{ volume.project }}</dd>
          </div>
          <div class="meta-row">
            <dt>Volume ID</dt>
            <dd>{{ volume.id }}</dd>
          </div>
          <div class="meta-row">
            <dt>Created</dt>
            <dd>{{ volume.created }}</dd>
          </div>
        </dl>

        <!-- I/O stats -->
        <div class="section-heading">I/O</div>
        <div class="sparklines-row">
          <div class="sparkline-block">
            <span class="spark-label">Read IOPS</span>
            <span class="spark-value">{{ volume.iopsRead > 0 ? volume.iopsRead.toLocaleString() : '—' }}</span>
          </div>
          <div class="sparklines-divider" />
          <div class="sparkline-block">
            <span class="spark-label">Write IOPS</span>
            <span class="spark-value">{{ volume.iopsWrite > 0 ? volume.iopsWrite.toLocaleString() : '—' }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="action-row">
          <button class="action-btn" disabled>Attach</button>
          <button class="action-btn" disabled>Detach</button>
          <button class="action-btn" disabled>Snapshot</button>
          <button class="action-btn danger" disabled>Delete</button>
        </div>

        <!-- Event log -->
        <div class="event-log">
          <div class="section-heading">Event log</div>
          <div class="log-list">
            <div
              v-for="(ev, i) in events"
              :key="i"
              :class="['log-row', ev.level]"
            >
              <span class="log-dot" aria-hidden="true" />
              <span class="log-msg">{{ ev.msg }}</span>
              <span class="log-time">{{ ev.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<style scoped>
/* Header */
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

/* Body */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Metadata */
.meta-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.meta-row:last-child { border-bottom: none; }

.meta-row dt {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 500;
}

.meta-row dd {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text);
  text-align: right;
}

.meta-pct {
  color: var(--color-text-muted);
  margin-left: var(--space-1);
}

/* Section heading */
.section-heading {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

/* I/O row — reuse sparklines-row pattern from Instance/Drawer */
.sparklines-row {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.sparkline-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spark-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.spark-value {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.sparklines-divider {
  width: 1px;
  height: 48px;
  background: var(--color-border);
  flex-shrink: 0;
}

/* Actions */
.action-row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 30px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) { background: var(--color-surface-2); }

.action-btn.danger {
  border-color: var(--color-status-faulted);
  color: var(--color-status-faulted);
}

.action-btn.danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-status-faulted) 10%, transparent);
}

/* Event log */
.event-log { display: flex; flex-direction: column; }

.log-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
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

<script setup lang="ts">
import type { Volume } from '~/data/analytics'

const props = defineProps<{
  volume: Volume | null
}>()

const emit = defineEmits<{ close: [] }>()

interface LogEntry {
  level: 'info' | 'warning' | 'error'
  message: string
  time: string
}

const events = computed<LogEntry[]>(() => {
  const v = props.volume
  if (!v) return []
  if (v.state === 'faulted') {
    return [
      { level: 'error',   message: 'I/O error — volume marked faulted',    time: '2d ago' },
      { level: 'warning', message: 'Elevated write latency detected',       time: '3d ago' },
      { level: 'info',    message: 'Volume created',                        time: v.created },
    ]
  }
  if (v.state === 'attached') {
    return [
      { level: 'info', message: `Attached to ${v.attachedInstance}`,        time: '—' },
      { level: 'info', message: `Snapshot ${v.name}.snap-02 created`,       time: '3d ago' },
      { level: 'info', message: `Snapshot ${v.name}.snap-01 created`,       time: '14d ago' },
      { level: 'info', message: 'Volume created',                           time: v.created },
    ]
  }
  return [
    { level: 'info', message: 'Detached from previous instance', time: '—' },
    { level: 'info', message: 'Volume created',                  time: v.created },
  ]
})
</script>

<template>
  <BaseDrawer
    :open="!!volume"
    :label="volume ? `Volume: ${volume.name}` : ''"
    @close="emit('close')"
  >
    <template v-if="volume">
      <BaseDrawerHeader
        :title="volume.name"
        :status="stateToStatus(volume.state)"
        :project="volume.project"
        @close="emit('close')"
      />

      <!-- Body -->
      <div class="drawer-body">
        <!-- Metadata -->
        <BaseDrawerMetaGrid>
          <div class="meta-row"><dt>Type</dt><dd>{{ volume.type }}</dd></div>
          <div class="meta-row"><dt>Size</dt><dd>{{ formatGib(volume.sizeGib) }}</dd></div>
          <div class="meta-row">
            <dt>Used</dt>
            <dd>
              {{ volume.usedGib > 0 ? formatGib(volume.usedGib) : '—' }}
              <span v-if="volume.usedGib > 0" class="meta-pct">({{ usedPct(volume) }}%)</span>
            </dd>
          </div>
          <div class="meta-row"><dt>Attached to</dt><dd>{{ volume.attachedInstance ?? '—' }}</dd></div>
          <div class="meta-row"><dt>Project</dt><dd>{{ volume.project }}</dd></div>
          <div class="meta-row"><dt>Volume ID</dt><dd>{{ volume.id }}</dd></div>
          <div class="meta-row"><dt>Created</dt><dd>{{ volume.created }}</dd></div>
        </BaseDrawerMetaGrid>

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
        <BaseDrawerEventLog :events="events" />
      </div>
    </template>
  </BaseDrawer>
</template>

<style scoped>
/* Body */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.meta-pct {
  color: var(--color-text-muted);
  margin-left: var(--space-1);
}

/* I/O row */
.sparklines-row {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-4);
  background: var(--color-table-row);
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


</style>

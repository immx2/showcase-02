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
        <BaseDrawerStatRow>
          <div class="sparkline-block">
            <span class="spark-label">Read IOPS</span>
            <span class="spark-value">{{ volume.iopsRead > 0 ? volume.iopsRead.toLocaleString() : '—' }}</span>
          </div>
          <div class="stat-divider" />
          <div class="sparkline-block">
            <span class="spark-label">Write IOPS</span>
            <span class="spark-value">{{ volume.iopsWrite > 0 ? volume.iopsWrite.toLocaleString() : '—' }}</span>
          </div>
        </BaseDrawerStatRow>

        <!-- Actions -->
        <div class="action-row">
          <BaseButton disabled>Attach</BaseButton>
          <BaseButton disabled>Detach</BaseButton>
          <BaseButton disabled>Snapshot</BaseButton>
          <BaseButton variant="danger" disabled>Delete</BaseButton>
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
  min-height: 0;
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

/* Actions */
.action-row {
  flex-shrink: 0;
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

</style>

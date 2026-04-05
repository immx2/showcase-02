<script setup lang="ts">
import type { Volume } from '~/data/analytics'

const props = defineProps<{ item: Volume }>()

interface LogEntry {
  level: 'info' | 'warning' | 'error'
  message: string
  time: string
}

const events = computed<LogEntry[]>(() => {
  const v = props.item
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
  <BaseDrawerBody>
    <BaseDrawerMetaGrid>
      <div class="meta-row"><dt>Type</dt><dd>{{ item.type }}</dd></div>
      <div class="meta-row"><dt>Size</dt><dd>{{ formatGib(item.sizeGib) }}</dd></div>
      <div class="meta-row">
        <dt>Used</dt>
        <dd>
          {{ item.usedGib > 0 ? formatGib(item.usedGib) : '—' }}
          <span v-if="item.usedGib > 0" class="meta-pct">({{ usedPct(item) }}%)</span>
        </dd>
      </div>
      <div class="meta-row"><dt>Attached to</dt><dd>{{ item.attachedInstance ?? '—' }}</dd></div>
      <div class="meta-row"><dt>Project</dt><dd>{{ item.project }}</dd></div>
      <div class="meta-row"><dt>Volume ID</dt><dd>{{ item.id }}</dd></div>
      <div class="meta-row"><dt>Created</dt><dd>{{ item.created }}</dd></div>
    </BaseDrawerMetaGrid>

    <BaseDrawerStatRow>
      <div class="sparkline-block">
        <span class="spark-label">Read IOPS</span>
        <span class="spark-value">{{ item.iopsRead > 0 ? item.iopsRead.toLocaleString() : '—' }}</span>
      </div>
      <div class="stat-divider" />
      <div class="sparkline-block">
        <span class="spark-label">Write IOPS</span>
        <span class="spark-value">{{ item.iopsWrite > 0 ? item.iopsWrite.toLocaleString() : '—' }}</span>
      </div>
    </BaseDrawerStatRow>

    <BaseDrawerActions>
      <BaseButton disabled>Attach</BaseButton>
      <BaseButton disabled>Detach</BaseButton>
      <BaseButton disabled>Snapshot</BaseButton>
      <BaseButton variant="danger" disabled>Delete</BaseButton>
    </BaseDrawerActions>

    <BaseDrawerEventLog :events="events" />
  </BaseDrawerBody>
</template>

<style scoped>
.meta-pct {
  color: var(--color-text-muted);
  margin-left: var(--space-1);
}
</style>

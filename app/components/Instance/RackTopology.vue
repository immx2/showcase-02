<script setup lang="ts">
import { instances, sledUsage } from '~/data/analytics'
import type { Instance, SledUsage } from '~/data/analytics'
import InstanceTooltipContent from './TooltipContent.vue'

const instancesBySled = (() => {
  const m = new Map<string, Instance[]>()
  for (const inst of instances) {
    const list = m.get(inst.sledId)
    if (list) list.push(inst)
    else m.set(inst.sledId, [inst])
  }
  return m
})()

const emit = defineEmits<{
  'select-instance': [instance: Instance]
}>()

interface SledRow {
  sled: SledUsage
  instances: Instance[]
  healthLevel: 'ok' | 'warn' | 'crit'
}

const sledRows = computed<SledRow[]>(() =>
  sledUsage.map(s => {
    const sledInsts = instancesBySled.get(s.sled) ?? []
    const level: SledRow['healthLevel'] =
      sledInsts.some(i => i.state === 'faulted') ? 'crit'
      : s.cpuPct >= 80 || s.memPct >= 88 ? 'warn'
      : 'ok'
    return { sled: s, instances: sledInsts, healthLevel: level }
  }),
)

const totalRunning = computed(() => instances.filter(i => i.state === 'running').length)
const totalFaulted = computed(() => instances.filter(i => i.state === 'faulted').length)

function abbreviate(name: string, max = 17): string {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

function onChipClick(inst: Instance) {
  emit('select-instance', inst)
}

function utilizationClass(pct: number): string {
  if (pct >= 80) return 'crit'
  if (pct >= 55) return 'warn'
  return 'ok'
}
</script>

<template>
  <div class="rack-wrap">
    <!-- Rack header -->
    <div class="rack-header">
      <div class="rack-label">
        <span class="rack-id">RACK-01</span>
        <span class="rack-meta">
          {{ sledRows.length }} sleds
          <span class="rack-dot" />
          {{ totalRunning }} running
          <template v-if="totalFaulted">
            <span class="rack-dot" />
            <span class="rack-faulted">{{ totalFaulted }} faulted</span>
          </template>
        </span>
      </div>
      <div class="rack-legend">
        <span class="legend-item">
          <span class="legend-swatch ok" />
          Healthy
        </span>
        <span class="legend-item">
          <span class="legend-swatch warn" />
          Warning
        </span>
        <span class="legend-item">
          <span class="legend-swatch crit" />
          Critical
        </span>
      </div>
    </div>

    <!-- Rack enclosure -->
    <div class="rack-enclosure ui-surface" role="list" aria-label="Rack topology">
      <!-- U-labels + sled rows -->
      <div
        v-for="(row, idx) in sledRows"
        :key="row.sled.sled"
        class="rack-unit"
        role="listitem"
        :aria-label="`Sled ${row.sled.sled}`"
      >
        <!-- U-number marker -->
        <div class="u-marker" aria-hidden="true">{{ idx + 1 }}U</div>

        <!-- Sled card -->
        <div :class="['sled-card', row.healthLevel]">
          <!-- Health accent strip -->
          <div class="sled-accent" aria-hidden="true" />

          <!-- Sled info -->
          <div class="sled-info">
            <div class="sled-identity">
              <span class="sled-name">{{ row.sled.sled }}</span>
              <span class="sled-count">{{ row.instances.length }} instances</span>
            </div>

            <!-- Utilization bars -->
            <div class="sled-metrics">
              <div class="metric-bar-group">
                <span class="metric-key">CPU</span>
                <div class="metric-track" role="progressbar" :aria-valuenow="row.sled.cpuPct" aria-valuemin="0" aria-valuemax="100">
                  <div
                    :class="['metric-fill', utilizationClass(row.sled.cpuPct)]"
                    :style="{ width: `${row.sled.cpuPct}%` }"
                  />
                </div>
                <span class="metric-val">{{ row.sled.cpuPct }}%</span>
              </div>
              <div class="metric-bar-group">
                <span class="metric-key">Mem</span>
                <div class="metric-track" role="progressbar" :aria-valuenow="row.sled.memPct" aria-valuemin="0" aria-valuemax="100">
                  <div
                    :class="['metric-fill', utilizationClass(row.sled.memPct)]"
                    :style="{ width: `${row.sled.memPct}%` }"
                  />
                </div>
                <span class="metric-val">{{ row.sled.memPct }}%</span>
              </div>
              <div class="metric-bar-group">
                <span class="metric-key">Disk</span>
                <div class="metric-track" role="progressbar" :aria-valuenow="row.sled.diskPct" aria-valuemin="0" aria-valuemax="100">
                  <div
                    :class="['metric-fill', utilizationClass(row.sled.diskPct)]"
                    :style="{ width: `${row.sled.diskPct}%` }"
                  />
                </div>
                <span class="metric-val">{{ row.sled.diskPct }}%</span>
              </div>
            </div>
          </div>

          <!-- Instance chips -->
          <div class="instance-chips" aria-label="Instances on this sled">
            <button
              v-for="inst in row.instances"
              :key="inst.id"
              :class="['chip', inst.state]"
              :aria-label="`${inst.name}, ${inst.state}`"
              v-bind="useTooltipTrigger({ is: InstanceTooltipContent, props: { instance: inst } })"
              @click="onChipClick(inst)"
            >
              <span class="chip-dot" :class="inst.state" aria-hidden="true" />
              <span class="chip-name">{{ abbreviate(inst.name) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.rack-wrap {
  width: 100%;
}

/* Rack header */
.rack-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.rack-label {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.rack-id {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text);
}

.rack-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.rack-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-muted);
  flex-shrink: 0;
}

.rack-faulted {
  color: var(--color-status-faulted);
}

.rack-legend {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-swatch.ok   { background: var(--color-status-running); }
.legend-swatch.warn { background: var(--color-status-starting); }
.legend-swatch.crit { background: var(--color-status-faulted); }

/* Rack enclosure */
.rack-enclosure {
  overflow: auto hidden;
}

/* Rack unit row */
.rack-unit {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--color-border-subtle);
  min-width: 640px;
}

.rack-unit:last-child {
  border-bottom: none;
}

.u-marker {
  width: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  border-right: 1px solid var(--color-border-subtle);
  background: var(--color-surface);
}

/* Sled card */
.sled-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-5);
  background: var(--color-table-row);
  min-width: 0;
}

.sled-card:hover {
  background: var(--color-surface);
}

.sled-accent {
  width: 3px;
  min-width: 3px;
  align-self: stretch;
  border-radius: 2px;
  flex-shrink: 0;
}

.sled-card.ok   .sled-accent { background: var(--color-status-running); }
.sled-card.warn .sled-accent { background: var(--color-status-starting); }
.sled-card.crit .sled-accent { background: var(--color-status-faulted); }

/* Sled info block */
.sled-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 200px;
  flex-shrink: 0;
}

.sled-identity {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.sled-name {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.sled-count {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Utilization bars */
.sled-metrics {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.metric-bar-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.metric-key {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  width: 24px;
  flex-shrink: 0;
}

.metric-track {
  width: 80px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
}

.metric-fill {
  height: 100%;
  border-radius: 2px;
  transition: width var(--motion-chart-draw);
}

.metric-fill.ok   { background: var(--color-accent); }
.metric-fill.warn { background: var(--color-status-starting); }
.metric-fill.crit { background: var(--color-status-faulted); }

.metric-val {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  width: 30px;
}

/* Instance chips */
.instance-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
  align-content: center;
}

.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: background var(--motion-interactive), border-color var(--motion-interactive);
  white-space: nowrap;
}

.chip:hover {
  background: var(--color-surface-2);
  border-color: var(--color-border);
}

.chip.faulted {
  border-color: var(--color-status-faulted);
  background: color-mix(in srgb, var(--color-status-faulted) 8%, var(--color-surface-2));
}

.chip.stopped {
  opacity: 0.55;
}

/* Chip dots */
.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chip-dot.running  { background: var(--color-status-running); }
.chip-dot.starting { background: var(--color-status-starting); animation: pulse var(--motion-pulse-ui); }
.chip-dot.stopped  { background: var(--color-status-stopped); }
.chip-dot.faulted  { background: var(--color-status-faulted); animation: pulse var(--motion-pulse-idle); }


.chip-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>

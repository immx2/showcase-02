<script setup lang="ts">
import type { Instance } from '~/data/analytics'
import { instanceSparklines, instanceMemSparklines } from '~/data/analytics'

const props = defineProps<{
  instance: Instance | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { addToast } = useToast()

// Deterministic event log keyed to instance data
interface LogEvent {
  time: string
  message: string
  level: 'info' | 'warning' | 'error'
}

const eventLog = computed<LogEvent[]>(() => {
  const inst = props.instance
  if (!inst) return []

  const events: LogEvent[] = []

  if (inst.state === 'faulted') {
    events.push({ time: '2h 03m ago', message: 'Kernel OOM kill — worker-ml-01 process terminated', level: 'error' })
    events.push({ time: '2h 05m ago', message: 'Memory utilization reached 100% — threshold exceeded', level: 'error' })
    events.push({ time: '2h 07m ago', message: 'Automated restart attempted — failed (exit code 137)', level: 'warning' })
    events.push({ time: '3d 11h ago', message: 'GPU driver updated to version 535.129.03', level: 'info' })
    return events
  }

  if (inst.state === 'starting') {
    events.push({ time: '0m ago', message: 'Instance boot sequence initiated', level: 'info' })
    events.push({ time: '0m ago', message: 'Waiting for network interface assignment', level: 'info' })
    if (inst.uptime !== '—') {
      events.push({ time: inst.uptime + ' ago', message: 'Previous session ended cleanly', level: 'info' })
    }
    return events
  }

  if (inst.state === 'stopped') {
    events.push({ time: '6d 2h ago', message: 'Instance stopped via API (user: ops-bot)', level: 'info' })
    events.push({ time: '6d 2h ago', message: 'Graceful shutdown — all processes exited', level: 'info' })
    events.push({ time: '31d 4h ago', message: 'Instance started', level: 'info' })
    return events
  }

  // Running instances
  if (inst.cpuPct >= 80) {
    events.push({ time: '18m ago', message: `CPU sustained above 80% for 15+ minutes`, level: 'warning' })
  }
  if (inst.memPct >= 88) {
    events.push({ time: '1h 12m ago', message: `Memory usage above 88% — monitor for growth`, level: 'warning' })
  }

  if (inst.name.includes('postgres') || inst.name.includes('redis')) {
    events.push({ time: '4d 7h ago', message: 'Automatic WAL checkpoint completed successfully', level: 'info' })
  }
  if (inst.name.includes('worker')) {
    events.push({ time: '1d 3h ago', message: 'Job queue processed 142k tasks — no errors', level: 'info' })
  }
  if (inst.name.includes('gateway') || inst.name.includes('frontend')) {
    events.push({ time: '6h 44m ago', message: 'TLS certificate rotated successfully', level: 'info' })
  }

  events.push({ time: inst.uptime + ' ago', message: 'Instance started', level: 'info' })
  events.push({ time: inst.uptime + ' ago', message: 'Cloud-init configuration applied', level: 'info' })

  return events.slice(0, 5)
})

// Actions
function sshCopy() {
  if (!props.instance) return
  navigator.clipboard.writeText(props.instance.ipv4).then(
    () => addToast(`Copied ${props.instance!.ipv4} to clipboard`, 'success'),
    () => addToast('Clipboard access denied', 'error'),
  )
}

function reboot() {
  addToast(`Reboot queued for ${props.instance?.name}`, 'info')
}

function stopInstance() {
  addToast(`Stop requested for ${props.instance?.name}`, 'info')
  emit('close')
}

function startInstance() {
  addToast(`Start requested for ${props.instance?.name}`, 'info')
  emit('close')
}

const canSSH   = computed(() => props.instance?.state === 'running')
const canStop  = computed(() => props.instance?.state === 'running' || props.instance?.state === 'starting')
const canStart = computed(() => props.instance?.state === 'stopped' || props.instance?.state === 'faulted')

const cpuSparkline = computed(() =>
  props.instance ? (instanceSparklines[props.instance.id] ?? []) : [],
)
const memSparkline = computed(() =>
  props.instance ? (instanceMemSparklines[props.instance.id] ?? []) : [],
)
</script>

<template>
  <AppDrawer
    :open="!!instance"
    :label="instance ? `Instance details: ${instance.name}` : ''"
    @close="emit('close')"
  >
    <template v-if="instance">
      <!-- Header -->
      <div class="drawer-header">
            <div class="drawer-title-row">
              <StatusBadge :status="instance.state" />
              <h2 class="drawer-title">{{ instance.name }}</h2>
            </div>
            <div class="drawer-header-meta">
              <span class="project-tag" :class="instance.project">{{ instance.project }}</span>
              <button class="close-btn" aria-label="Close drawer" @click="emit('close')">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="drawer-body">
            <!-- Sparklines row -->
            <div class="sparklines-row">
              <div class="sparkline-block">
                <span class="spark-label">CPU</span>
                <ChartSparkline
                  :data="cpuSparkline"
                  :width="100"
                  :height="32"
                  color="var(--chart-1)"
                />
                <span class="spark-value">{{ instance.cpuPct }}%</span>
              </div>
              <div class="sparklines-divider" />
              <div class="sparkline-block">
                <span class="spark-label">Mem</span>
                <ChartSparkline
                  :data="memSparkline"
                  :width="100"
                  :height="32"
                  color="var(--chart-2)"
                />
                <span class="spark-value">{{ instance.memPct }}%</span>
              </div>
            </div>

            <!-- Metadata grid -->
            <dl class="meta-grid">
              <div class="meta-row">
                <dt>Instance ID</dt>
                <dd>{{ instance.id }}</dd>
              </div>
              <div class="meta-row">
                <dt>IPv4</dt>
                <dd>{{ instance.ipv4 }}</dd>
              </div>
              <div class="meta-row">
                <dt>vCPUs</dt>
                <dd>{{ instance.cpuCount }}</dd>
              </div>
              <div class="meta-row">
                <dt>Memory</dt>
                <dd>{{ instance.memGiB }} GiB</dd>
              </div>
              <div class="meta-row">
                <dt>Sled</dt>
                <dd>{{ instance.sledId }}</dd>
              </div>
              <div class="meta-row">
                <dt>Uptime</dt>
                <dd>{{ instance.uptime !== '—' ? instance.uptime : 'Not running' }}</dd>
              </div>
            </dl>

            <!-- Action buttons -->
            <div class="action-row">
              <button
                class="action-btn primary"
                :disabled="!canSSH"
                :title="canSSH ? 'Copy IP for SSH' : 'Instance must be running'"
                @click="sshCopy"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M4 7l2 1.5L4 10M8 9h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                SSH
              </button>
              <button
                class="action-btn"
                :disabled="!canSSH"
                title="Queue a reboot"
                @click="reboot"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M11 7A4 4 0 1 1 7 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  <path d="M7 1l2 2-2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Reboot
              </button>
              <button
                v-if="canStop"
                class="action-btn danger"
                @click="stopInstance"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/>
                </svg>
                Stop
              </button>
              <button
                v-if="canStart"
                class="action-btn"
                @click="startInstance"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M4 2.5l7 4.5-7 4.5V2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                </svg>
                Start
              </button>
            </div>

            <!-- Event log -->
            <div class="event-log">
              <div class="section-heading">Event log</div>
              <div class="log-list">
                <div
                  v-for="(ev, i) in eventLog"
                  :key="i"
                  :class="['log-row', ev.level]"
                >
                  <span class="log-dot" aria-hidden="true" />
                  <span class="log-msg">{{ ev.message }}</span>
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

/* Sparklines */
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

.meta-row:last-child {
  border-bottom: none;
}

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

.action-btn:hover:not(:disabled) {
  background: var(--color-surface-2);
}

.action-btn.primary {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.action-btn.primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.action-btn.danger {
  border-color: var(--color-status-faulted);
  color: var(--color-status-faulted);
}

.action-btn.danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-status-faulted) 10%, transparent);
}

/* Event log */
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

.log-row:last-child {
  border-bottom: none;
}

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

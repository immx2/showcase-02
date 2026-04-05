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
  <BaseDrawer
    :open="!!instance"
    :label="instance ? `Instance details: ${instance.name}` : ''"
    @close="emit('close')"
  >
    <template v-if="instance">
      <BaseDrawerHeader
        :title="instance.name"
        :status="instance.state"
        :project="instance.project"
        @close="emit('close')"
      />

      <div class="drawer-body">
            <!-- Sparklines row -->
            <BaseDrawerStatRow>
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
              <div class="stat-divider" />
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
            </BaseDrawerStatRow>

            <!-- Metadata grid -->
            <BaseDrawerMetaGrid>
              <div class="meta-row"><dt>Instance ID</dt><dd>{{ instance.id }}</dd></div>
              <div class="meta-row"><dt>IPv4</dt><dd>{{ instance.ipv4 }}</dd></div>
              <div class="meta-row"><dt>vCPUs</dt><dd>{{ instance.cpuCount }}</dd></div>
              <div class="meta-row"><dt>Memory</dt><dd>{{ instance.memGiB }} GiB</dd></div>
              <div class="meta-row"><dt>Sled</dt><dd>{{ instance.sledId }}</dd></div>
              <div class="meta-row"><dt>Uptime</dt><dd>{{ instance.uptime !== '—' ? instance.uptime : 'Not running' }}</dd></div>
            </BaseDrawerMetaGrid>

            <!-- Action buttons -->
            <div class="action-row">
              <BaseButton
                variant="primary"
                :disabled="!canSSH"
                :title="canSSH ? 'Copy IP for SSH' : 'Instance must be running'"
                @click="sshCopy"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M4 7l2 1.5L4 10M8 9h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                SSH
              </BaseButton>
              <BaseButton
                :disabled="!canSSH"
                title="Queue a reboot"
                @click="reboot"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M11 7A4 4 0 1 1 7 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  <path d="M7 1l2 2-2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Reboot
              </BaseButton>
              <BaseButton
                v-if="canStop"
                variant="danger"
                @click="stopInstance"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/>
                </svg>
                Stop
              </BaseButton>
              <BaseButton
                v-if="canStart"
                @click="startInstance"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M4 2.5l7 4.5-7 4.5V2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                </svg>
                Start
              </BaseButton>
            </div>

            <!-- Event log -->
            <BaseDrawerEventLog :events="eventLog" />
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

/* Actions */
.action-row {
  flex-shrink: 0;
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

</style>

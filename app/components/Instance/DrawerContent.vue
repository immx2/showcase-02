<script setup lang="ts">
import { instanceSparklines, instanceMemSparklines, type Instance } from '~/data/analytics'

const props = defineProps<{ item: Instance }>()

const { close } = useAppDrawer()
const { addToast } = useToast()

interface LogEvent {
  time: string
  message: string
  level: 'info' | 'warning' | 'error'
}

const eventLog = computed<LogEvent[]>(() => {
  const inst = props.item
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

  if (inst.cpuPct >= 80) {
    events.push({ time: '18m ago', message: 'CPU sustained above 80% for 15+ minutes', level: 'warning' })
  }
  if (inst.memPct >= 88) {
    events.push({ time: '1h 12m ago', message: 'Memory usage above 88% — monitor for growth', level: 'warning' })
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

function sshCopy() {
  navigator.clipboard.writeText(props.item.ipv4).then(
    () => addToast(`Copied ${props.item.ipv4} to clipboard`, 'success'),
    () => addToast('Clipboard access denied', 'error'),
  )
}

function reboot() {
  addToast(`Reboot queued for ${props.item.name}`, 'info')
}

function stopInstance() {
  addToast(`Stop requested for ${props.item.name}`, 'info')
  close()
}

function startInstance() {
  addToast(`Start requested for ${props.item.name}`, 'info')
  close()
}

const canSSH   = computed(() => props.item.state === 'running')
const canStop  = computed(() => props.item.state === 'running' || props.item.state === 'starting')
const canStart = computed(() => props.item.state === 'stopped' || props.item.state === 'faulted')

const cpuSparkline = computed(() => instanceSparklines[props.item.id] ?? [])
const memSparkline = computed(() => instanceMemSparklines[props.item.id] ?? [])
</script>

<template>
  <BaseDrawerBody>
    <BaseDrawerStatRow>
      <div class="sparkline-block">
        <span class="spark-label">CPU</span>
        <ChartSparkline :data="cpuSparkline" :width="100" :height="32" color="var(--chart-1)" />
        <span class="spark-value">{{ item.cpuPct }}%</span>
      </div>
      <div class="stat-divider" />
      <div class="sparkline-block">
        <span class="spark-label">Mem</span>
        <ChartSparkline :data="memSparkline" :width="100" :height="32" color="var(--chart-2)" />
        <span class="spark-value">{{ item.memPct }}%</span>
      </div>
    </BaseDrawerStatRow>

    <BaseDrawerMetaGrid>
      <div class="meta-row"><dt>Instance ID</dt><dd>{{ item.id }}</dd></div>
      <div class="meta-row"><dt>IPv4</dt><dd>{{ item.ipv4 }}</dd></div>
      <div class="meta-row"><dt>vCPUs</dt><dd>{{ item.cpuCount }}</dd></div>
      <div class="meta-row"><dt>Memory</dt><dd>{{ item.memGiB }} GiB</dd></div>
      <div class="meta-row"><dt>Sled</dt><dd>{{ item.sledId }}</dd></div>
      <div class="meta-row"><dt>Uptime</dt><dd>{{ item.uptime !== '—' ? item.uptime : 'Not running' }}</dd></div>
    </BaseDrawerMetaGrid>

    <BaseDrawerActions>
      <TextTooltip :content="canSSH ? 'Copy IP for SSH' : 'Instance must be running'">
      <BaseButton
        variant="primary"
        :disabled="!canSSH"
        @click="sshCopy"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M4 7l2 1.5L4 10M8 9h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        SSH
      </BaseButton>
      </TextTooltip>
      <TextTooltip content="Queue a reboot">
      <BaseButton :disabled="!canSSH" @click="reboot">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M11 7A4 4 0 1 1 7 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M7 1l2 2-2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Reboot
      </BaseButton>
      </TextTooltip>
      <BaseButton v-if="canStop" variant="danger" @click="stopInstance">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/>
        </svg>
        Stop
      </BaseButton>
      <BaseButton v-if="canStart" @click="startInstance">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4 2.5l7 4.5-7 4.5V2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
        Start
      </BaseButton>
    </BaseDrawerActions>

    <BaseDrawerEventLog :events="eventLog" />
  </BaseDrawerBody>
</template>

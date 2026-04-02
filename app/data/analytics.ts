// Seeded PRNG for deterministic data across renders
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// ─── Metric time-series ────────────────────────────────────────────────────

export interface MetricSample {
  date: string
  cpu: number      // percent 0–100
  mem: number      // percent 0–100
  netGbps: number  // aggregate network throughput
  diskIops: number // aggregate disk IOPS
}

function generateMetricSamples(): MetricSample[] {
  const rng = mulberry32(7)
  const samples: MetricSample[] = []
  const start = new Date(2025, 5, 7) // June 7 2025

  let baseCpu = 42
  let baseMem = 58
  let baseNet = 1.4
  let baseDisk = 8200

  for (let i = 0; i < 90; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)

    baseCpu = Math.min(92, Math.max(18, baseCpu + (rng() - 0.48) * 4))
    baseMem = Math.min(88, Math.max(32, baseMem + (rng() - 0.45) * 2.5))
    baseNet = Math.min(6.5, Math.max(0.4, baseNet + (rng() - 0.5) * 0.25))
    baseDisk = Math.min(24000, Math.max(3000, baseDisk + (rng() - 0.5) * 600))

    samples.push({
      date: d.toISOString().split('T')[0]!,
      cpu: Math.round(baseCpu * 10) / 10,
      mem: Math.round(baseMem * 10) / 10,
      netGbps: Math.round(baseNet * 100) / 100,
      diskIops: Math.round(baseDisk),
    })
  }

  return samples
}

export const metricSamples: MetricSample[] = generateMetricSamples()

// ─── Instances ────────────────────────────────────────────────────────────

export type InstanceState = 'running' | 'starting' | 'stopped' | 'faulted'

export interface Instance {
  id: string
  name: string
  state: InstanceState
  project: 'infra' | 'web' | 'data'
  sledId: string
  cpuCount: number
  memGiB: number
  cpuPct: number
  memPct: number
  ipv4: string
  uptime: string
}

export const instances: Instance[] = [
  { id: 'inst-4a8f2e1b', name: 'api-gateway-01',     state: 'running',  project: 'infra', sledId: 'sled-01', cpuCount: 8,  memGiB: 32,  cpuPct: 38,  memPct: 61, ipv4: '172.20.0.10', uptime: '42d 7h' },
  { id: 'inst-7c3d9f0a', name: 'api-gateway-02',     state: 'running',  project: 'infra', sledId: 'sled-01', cpuCount: 8,  memGiB: 32,  cpuPct: 41,  memPct: 58, ipv4: '172.20.0.11', uptime: '42d 7h' },
  { id: 'inst-b2e5c8d3', name: 'postgres-primary',   state: 'running',  project: 'data',  sledId: 'sled-01', cpuCount: 16, memGiB: 128, cpuPct: 72,  memPct: 84, ipv4: '172.20.1.20', uptime: '89d 3h' },
  { id: 'inst-1f6a4b7c', name: 'postgres-replica-a', state: 'running',  project: 'data',  sledId: 'sled-01', cpuCount: 16, memGiB: 128, cpuPct: 18,  memPct: 79, ipv4: '172.20.1.21', uptime: '89d 3h' },
  { id: 'inst-9d0e2f3a', name: 'postgres-replica-b', state: 'running',  project: 'data',  sledId: 'sled-02', cpuCount: 16, memGiB: 128, cpuPct: 14,  memPct: 77, ipv4: '172.20.1.22', uptime: '72d 18h' },
  { id: 'inst-c5b8d1e6', name: 'web-frontend-01',    state: 'running',  project: 'web',   sledId: 'sled-02', cpuCount: 4,  memGiB: 16,  cpuPct: 24,  memPct: 44, ipv4: '172.20.2.30', uptime: '31d 12h' },
  { id: 'inst-3e7f9a0b', name: 'web-frontend-02',    state: 'running',  project: 'web',   sledId: 'sled-02', cpuCount: 4,  memGiB: 16,  cpuPct: 21,  memPct: 42, ipv4: '172.20.2.31', uptime: '31d 12h' },
  { id: 'inst-d4c2b8f1', name: 'web-frontend-03',    state: 'running',  project: 'web',   sledId: 'sled-02', cpuCount: 4,  memGiB: 16,  cpuPct: 27,  memPct: 46, ipv4: '172.20.2.32', uptime: '14d 5h' },
  { id: 'inst-6a1e5d9c', name: 'redis-cache-01',     state: 'running',  project: 'infra', sledId: 'sled-03', cpuCount: 4,  memGiB: 32,  cpuPct: 9,   memPct: 91, ipv4: '172.20.0.50', uptime: '61d 22h' },
  { id: 'inst-2b7f0e4d', name: 'redis-cache-02',     state: 'running',  project: 'infra', sledId: 'sled-03', cpuCount: 4,  memGiB: 32,  cpuPct: 8,   memPct: 89, ipv4: '172.20.0.51', uptime: '61d 22h' },
  { id: 'inst-8c3a6f1e', name: 'worker-batch-01',    state: 'running',  project: 'data',  sledId: 'sled-03', cpuCount: 32, memGiB: 64,  cpuPct: 88,  memPct: 52, ipv4: '172.20.1.60', uptime: '7d 14h' },
  { id: 'inst-e9d5b2a7', name: 'worker-batch-02',    state: 'running',  project: 'data',  sledId: 'sled-03', cpuCount: 32, memGiB: 64,  cpuPct: 91,  memPct: 55, ipv4: '172.20.1.61', uptime: '7d 14h' },
  { id: 'inst-f1c4e8b0', name: 'worker-batch-03',    state: 'running',  project: 'data',  sledId: 'sled-04', cpuCount: 32, memGiB: 64,  cpuPct: 83,  memPct: 49, ipv4: '172.20.1.62', uptime: '7d 14h' },
  { id: 'inst-0a8d3c5f', name: 'metrics-collector',  state: 'running',  project: 'infra', sledId: 'sled-04', cpuCount: 4,  memGiB: 8,   cpuPct: 15,  memPct: 38, ipv4: '172.20.0.70', uptime: '42d 7h' },
  { id: 'inst-7e2b4d9a', name: 'log-aggregator',     state: 'running',  project: 'infra', sledId: 'sled-04', cpuCount: 8,  memGiB: 16,  cpuPct: 31,  memPct: 67, ipv4: '172.20.0.71', uptime: '42d 7h' },
  { id: 'inst-5f1c8e3b', name: 'search-index-01',    state: 'running',  project: 'web',   sledId: 'sled-04', cpuCount: 8,  memGiB: 32,  cpuPct: 44,  memPct: 73, ipv4: '172.20.2.80', uptime: '28d 1h' },
  { id: 'inst-a3d6f0c9', name: 'search-index-02',    state: 'running',  project: 'web',   sledId: 'sled-05', cpuCount: 8,  memGiB: 32,  cpuPct: 39,  memPct: 71, ipv4: '172.20.2.81', uptime: '28d 1h' },
  { id: 'inst-4b9e7a2f', name: 'cdn-origin-proxy',   state: 'running',  project: 'web',   sledId: 'sled-05', cpuCount: 4,  memGiB: 8,   cpuPct: 12,  memPct: 31, ipv4: '172.20.2.90', uptime: '55d 9h' },
  { id: 'inst-c8f3b1d4', name: 'etl-pipeline-01',    state: 'starting', project: 'data',  sledId: 'sled-05', cpuCount: 16, memGiB: 32,  cpuPct: 4,   memPct: 12, ipv4: '172.20.1.40', uptime: '0d 0h' },
  { id: 'inst-6d2a9f5e', name: 'etl-pipeline-02',    state: 'starting', project: 'data',  sledId: 'sled-05', cpuCount: 16, memGiB: 32,  cpuPct: 2,   memPct: 8,  ipv4: '172.20.1.41', uptime: '0d 0h' },
  { id: 'inst-1e8c4b7a', name: 'qa-runner-03',       state: 'stopped',  project: 'infra', sledId: 'sled-06', cpuCount: 4,  memGiB: 8,   cpuPct: 0,   memPct: 0,  ipv4: '172.20.0.92', uptime: '—' },
  { id: 'inst-9b5f2e0d', name: 'staging-web-01',     state: 'stopped',  project: 'web',   sledId: 'sled-06', cpuCount: 4,  memGiB: 16,  cpuPct: 0,   memPct: 0,  ipv4: '172.20.2.44', uptime: '—' },
  { id: 'inst-3a7c1f6b', name: 'staging-db',         state: 'stopped',  project: 'data',  sledId: 'sled-06', cpuCount: 8,  memGiB: 32,  cpuPct: 0,   memPct: 0,  ipv4: '172.20.1.45', uptime: '—' },
  { id: 'inst-e2d4a8c5', name: 'worker-ml-01',       state: 'faulted',  project: 'data',  sledId: 'sled-06', cpuCount: 32, memGiB: 128, cpuPct: 0,   memPct: 0,  ipv4: '172.20.1.55', uptime: '—' },
]

// ─── Per-instance sparklines (synthetic CPU history) ──────────────────────

function generateInstanceSparklines(): Record<string, number[]> {
  const result: Record<string, number[]> = {}
  for (const inst of instances) {
    if (inst.state === 'stopped' || inst.state === 'faulted') {
      result[inst.id] = Array(20).fill(0)
      continue
    }
    const rng = mulberry32(hashStr(inst.id))
    const sparkline: number[] = []
    let v = inst.cpuPct
    for (let i = 0; i < 20; i++) {
      v = Math.min(100, Math.max(0, v + (rng() - 0.5) * 14))
      sparkline.push(Math.round(v))
    }
    result[inst.id] = sparkline
  }
  return result
}

export const instanceSparklines: Record<string, number[]> = generateInstanceSparklines()

function generateInstanceMemSparklines(): Record<string, number[]> {
  const result: Record<string, number[]> = {}
  for (const inst of instances) {
    if (inst.state === 'stopped' || inst.state === 'faulted') {
      result[inst.id] = Array(20).fill(0)
      continue
    }
    const rng = mulberry32(hashStr(inst.id) + 9973) // distinct seed from CPU
    const sparkline: number[] = []
    let v = inst.memPct
    for (let i = 0; i < 20; i++) {
      v = Math.min(100, Math.max(0, v + (rng() - 0.5) * 7))
      sparkline.push(Math.round(v))
    }
    result[inst.id] = sparkline
  }
  return result
}

export const instanceMemSparklines: Record<string, number[]> = generateInstanceMemSparklines()

// ─── Sled utilization ─────────────────────────────────────────────────────

export interface SledUsage {
  sled: string
  cpuPct: number
  memPct: number
  diskPct: number
  color: string
}

export const sledUsage: SledUsage[] = [
  { sled: 'sled-01', cpuPct: 68, memPct: 74, diskPct: 42, color: 'var(--chart-1)' },
  { sled: 'sled-02', cpuPct: 81, memPct: 62, diskPct: 38, color: 'var(--chart-2)' },
  { sled: 'sled-03', cpuPct: 44, memPct: 55, diskPct: 61, color: 'var(--chart-3)' },
  { sled: 'sled-04', cpuPct: 72, memPct: 88, diskPct: 35, color: 'var(--chart-4)' },
  { sled: 'sled-05', cpuPct: 29, memPct: 41, diskPct: 28, color: 'var(--chart-5)' },
  { sled: 'sled-06', cpuPct: 56, memPct: 63, diskPct: 54, color: 'var(--chart-6)' },
]

// ─── Per-sled metric time-series (90 days, aligned with metricSamples) ───────

export interface SledMetricSample {
  cpuPct: number
  memPct: number
  diskPct: number
}

function generateSledSeries(sled: SledUsage): SledMetricSample[] {
  const rng = mulberry32(hashStr(sled.sled))
  const samples: SledMetricSample[] = []
  let cpu  = sled.cpuPct  * (0.78 + rng() * 0.18)
  let mem  = sled.memPct  * (0.80 + rng() * 0.15)
  let disk = sled.diskPct * (0.85 + rng() * 0.10)
  for (let i = 0; i < 90; i++) {
    cpu  = Math.min(99, Math.max(1, cpu  + (rng() - 0.48) * 5))
    mem  = Math.min(99, Math.max(1, mem  + (rng() - 0.45) * 3))
    disk = Math.min(99, Math.max(1, disk + (rng() - 0.49) * 1.5))
    samples.push({
      cpuPct:  Math.round(cpu  * 10) / 10,
      memPct:  Math.round(mem  * 10) / 10,
      diskPct: Math.round(disk * 10) / 10,
    })
  }
  return samples
}

export const sledMetricSeries: Record<string, SledMetricSample[]> = Object.fromEntries(
  sledUsage.map(s => [s.sled, generateSledSeries(s)]),
)

// ─── Storage breakdown ────────────────────────────────────────────────────

export interface StorageBreakdown {
  label: string
  gib: number
  color: string
}

export const storageBreakdown: StorageBreakdown[] = [
  { label: 'Data disks',  gib: 18432, color: 'var(--chart-1)' },
  { label: 'Snapshots',   gib: 8192,  color: 'var(--chart-2)' },
  { label: 'OS images',   gib: 3072,  color: 'var(--chart-3)' },
  { label: 'Reserved',    gib: 2048,  color: 'var(--chart-4)' },
]

// ─── Storage history (90 days, ends at current storageBreakdown total) ────────

export interface StorageSample {
  date: string
  totalGib: number
}

function generateStorageHistory(): StorageSample[] {
  const total = storageBreakdown.reduce((s, d) => s + d.gib, 0)
  const rng = mulberry32(23)
  const samples: StorageSample[] = []
  let current = total * 0.80
  const dailyTarget = (total - current) / 90
  const start = new Date(2025, 5, 7) // June 7 2025 — aligned with metricSamples
  for (let i = 0; i < 89; i++) {
    current = Math.min(total, current + dailyTarget * (0.3 + rng() * 1.4))
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    samples.push({ date: d.toISOString().split('T')[0]!, totalGib: Math.round(current) })
  }
  const last = new Date(start)
  last.setDate(last.getDate() + 89)
  samples.push({ date: last.toISOString().split('T')[0]!, totalGib: total })
  return samples
}

export const storageHistory: StorageSample[] = generateStorageHistory()

// ─── Volumes ──────────────────────────────────────────────────────────────

export type VolumeState = 'attached' | 'available' | 'detached' | 'creating' | 'faulted'
export type VolumeType = 'NVMe SSD' | 'SSD' | 'HDD'

export interface Volume {
  id: string
  name: string
  state: VolumeState
  type: VolumeType
  sizeGib: number
  usedGib: number
  attachedInstance: string | null
  project: 'infra' | 'web' | 'data'
  created: string
  iopsRead: number
  iopsWrite: number
}

export const volumes: Volume[] = [
  { id: 'vol-a1b2c3d4', name: 'vol-db-primary-data',   state: 'attached',  type: 'NVMe SSD', sizeGib: 2048, usedGib: 1536, attachedInstance: 'postgres-primary',   project: 'data',  created: '2025-03-05', iopsRead: 11200, iopsWrite: 7400 },
  { id: 'vol-e5f6a7b8', name: 'vol-db-replica-a',      state: 'attached',  type: 'NVMe SSD', sizeGib: 2048, usedGib: 1524, attachedInstance: 'postgres-replica-a', project: 'data',  created: '2025-03-05', iopsRead: 8900,  iopsWrite: 2100 },
  { id: 'vol-c9d0e1f2', name: 'vol-db-replica-b',      state: 'attached',  type: 'NVMe SSD', sizeGib: 2048, usedGib: 1518, attachedInstance: 'postgres-replica-b', project: 'data',  created: '2025-03-21', iopsRead: 8600,  iopsWrite: 1900 },
  { id: 'vol-g3h4i5j6', name: 'vol-worker-scratch-01', state: 'attached',  type: 'NVMe SSD', sizeGib: 1024, usedGib: 812,  attachedInstance: 'worker-batch-01',    project: 'data',  created: '2025-05-26', iopsRead: 9800,  iopsWrite: 6200 },
  { id: 'vol-k7l8m9n0', name: 'vol-worker-scratch-02', state: 'attached',  type: 'NVMe SSD', sizeGib: 1024, usedGib: 791,  attachedInstance: 'worker-batch-02',    project: 'data',  created: '2025-05-26', iopsRead: 9600,  iopsWrite: 6100 },
  { id: 'vol-o1p2q3r4', name: 'vol-worker-scratch-03', state: 'attached',  type: 'NVMe SSD', sizeGib: 1024, usedGib: 834,  attachedInstance: 'worker-batch-03',    project: 'data',  created: '2025-05-26', iopsRead: 9400,  iopsWrite: 5900 },
  { id: 'vol-s5t6u7v8', name: 'vol-search-index-01',   state: 'attached',  type: 'NVMe SSD', sizeGib: 512,  usedGib: 387,  attachedInstance: 'search-index-01',    project: 'web',   created: '2025-06-06', iopsRead: 7200,  iopsWrite: 3400 },
  { id: 'vol-w9x0y1z2', name: 'vol-search-index-02',   state: 'attached',  type: 'NVMe SSD', sizeGib: 512,  usedGib: 391,  attachedInstance: 'search-index-02',    project: 'web',   created: '2025-06-06', iopsRead: 7100,  iopsWrite: 3300 },
  { id: 'vol-a3b4c5d6', name: 'vol-log-archive',       state: 'attached',  type: 'HDD',      sizeGib: 4096, usedGib: 2891, attachedInstance: 'log-aggregator',     project: 'infra', created: '2025-03-21', iopsRead: 210,   iopsWrite: 140  },
  { id: 'vol-e7f8g9h0', name: 'vol-etl-staging',       state: 'attached',  type: 'SSD',      sizeGib: 512,  usedGib: 104,  attachedInstance: 'etl-pipeline-01',    project: 'data',  created: '2025-09-01', iopsRead: 3800,  iopsWrite: 1900 },
  { id: 'vol-i1j2k3l4', name: 'vol-backup-pool-01',    state: 'available', type: 'SSD',      sizeGib: 2048, usedGib: 0,    attachedInstance: null,                 project: 'infra', created: '2025-04-15', iopsRead: 4200,  iopsWrite: 2100 },
  { id: 'vol-m5n6o7p8', name: 'vol-backup-pool-02',    state: 'available', type: 'SSD',      sizeGib: 2048, usedGib: 0,    attachedInstance: null,                 project: 'infra', created: '2025-04-15', iopsRead: 4100,  iopsWrite: 2000 },
  { id: 'vol-q9r0s1t2', name: 'vol-snapshot-archive',  state: 'available', type: 'HDD',      sizeGib: 4096, usedGib: 0,    attachedInstance: null,                 project: 'infra', created: '2025-05-01', iopsRead: 180,   iopsWrite: 90   },
  { id: 'vol-u3v4w5x6', name: 'vol-staging-db-old',    state: 'detached',  type: 'SSD',      sizeGib: 256,  usedGib: 198,  attachedInstance: null,                 project: 'data',  created: '2025-02-14', iopsRead: 0,     iopsWrite: 0    },
  { id: 'vol-y7z8a9b0', name: 'vol-qa-data',           state: 'detached',  type: 'NVMe SSD', sizeGib: 128,  usedGib: 67,   attachedInstance: null,                 project: 'infra', created: '2025-06-14', iopsRead: 0,     iopsWrite: 0    },
  { id: 'vol-c1d2e3f4', name: 'vol-ml-training-set',   state: 'faulted',   type: 'NVMe SSD', sizeGib: 4096, usedGib: 0,    attachedInstance: null,                 project: 'data',  created: '2025-08-20', iopsRead: 0,     iopsWrite: 0    },
]

// KPI sparklines for the Storage page (20-point trends, seeded)
function generateStorageKpiSparklines() {
  const capacitySparkline = storageHistory.slice(-20).map(s => s.totalGib)

  const rng = mulberry32(41)
  const usedPctSparkline: number[] = []
  let usedPct = 58
  for (let i = 0; i < 20; i++) {
    usedPct = Math.min(85, Math.max(40, usedPct + (rng() - 0.45) * 3))
    usedPctSparkline.push(Math.round(usedPct * 10) / 10)
  }

  const volumeCountSparkline = [11, 11, 12, 12, 12, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16]
  const snapshotCountSparkline = [14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 22, 23, 23]

  return { capacitySparkline, usedPctSparkline, volumeCountSparkline, snapshotCountSparkline }
}

export const storageKpiSparklines = generateStorageKpiSparklines()

// ─── Heatmap (API request rate) ───────────────────────────────────────────

export interface HeatmapCell {
  day: number
  hour: number
  count: number
}

function generateHeatmap(): HeatmapCell[] {
  const rng = mulberry32(17)
  const cells: HeatmapCell[] = []

  for (let day = 0; day < 7; day++) {
    const isWeekend = day >= 5
    for (let hour = 0; hour < 24; hour++) {
      const isPeak = hour >= 8 && hour <= 18
      const isNight = hour < 5

      let base = isWeekend ? 35 : 80
      if (isPeak) base = isWeekend ? 110 : 420
      else if (isNight) base = isWeekend ? 12 : 22

      cells.push({
        day,
        hour,
        count: Math.round(base * (0.7 + rng() * 0.6)),
      })
    }
  }
  return cells
}

export const heatmapData: HeatmapCell[] = generateHeatmap()

import {
  metricSamples,
  instances,
  sledUsage,
  storageBreakdown,
  heatmapData,
  type MetricSample,
  type InstanceState,
} from '~/data/analytics'

export interface BarGroupValue {
  key: string
  value: number
  color: string
}

export interface BarGroup {
  label: string
  values: BarGroupValue[]
}

export type Period = '7d' | '30d' | '90d'
export type Project = 'all' | 'infra' | 'web' | 'data'
export type SortKey = 'name' | 'state' | 'project' | 'cpuCount' | 'memGiB' | 'cpuPct' | 'memPct'
export type SortDir = 'asc' | 'desc'

export interface Kpi {
  label: string
  value: number
  previousValue: number
  format: 'number' | 'percent' | 'bytes' | 'throughput'
  trend: number
  trendPositiveWhenDown?: boolean
  sparkline: number[]
  unit?: string
}

const PERIOD_DAYS: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

function slice(metrics: MetricSample[], days: number): MetricSample[] {
  return metrics.slice(Math.max(0, metrics.length - days))
}

function prevSlice(metrics: MetricSample[], days: number): MetricSample[] {
  const end = Math.max(0, metrics.length - days)
  return metrics.slice(Math.max(0, end - days), end)
}

// State ordering for sort
const STATE_ORDER: Record<InstanceState, number> = {
  faulted: 0,
  starting: 1,
  running: 2,
  stopped: 3,
}

// Live simulation state — module-level so it persists across hot reloads
const liveSamples = ref([...metricSamples])
const isLive = ref(false)
let liveInterval: ReturnType<typeof setInterval> | undefined

export function useDashboard() {
  const period = ref<Period>('30d')
  const selectedProject = ref<Project>('all')
  const sortKey = ref<SortKey>('cpuPct')
  const sortDir = ref<SortDir>('desc')
  const isLoading = ref(false)

  let loadTimer: ReturnType<typeof setTimeout> | undefined
  watch(period, () => {
    isLoading.value = true
    clearTimeout(loadTimer)
    loadTimer = setTimeout(() => { isLoading.value = false }, 350)
  })

  function startLive() {
    if (isLive.value) return
    isLive.value = true
    liveInterval = setInterval(() => {
      const last = liveSamples.value[liveSamples.value.length - 1]
      const rng = Math.random
      const newCpu  = Math.min(95, Math.max(5,    last.cpu     + (rng() - 0.48) * 6))
      const newMem  = Math.min(92, Math.max(20,   last.mem     + (rng() - 0.45) * 3))
      const newNet  = Math.min(8,  Math.max(0.2,  last.netGbps + (rng() - 0.5)  * 0.3))
      const newDisk = Math.min(30000, Math.max(2000, last.diskIops + (rng() - 0.5) * 800))
      const now = new Date()
      liveSamples.value = [
        ...liveSamples.value.slice(-89),
        {
          date:     now.toISOString().split('T')[0],
          cpu:      Math.round(newCpu * 10) / 10,
          mem:      Math.round(newMem * 10) / 10,
          netGbps:  Math.round(newNet * 100) / 100,
          diskIops: Math.round(newDisk),
        },
      ]
    }, 3000)
  }

  function stopLive() {
    isLive.value = false
    clearInterval(liveInterval)
    liveInterval = undefined
  }

  function toggleLive() {
    if (isLive.value) stopLive()
    else startLive()
  }

  const filteredMetrics = computed(() =>
    slice(liveSamples.value, PERIOD_DAYS[period.value]),
  )

  const previousMetrics = computed(() =>
    prevSlice(liveSamples.value, PERIOD_DAYS[period.value]),
  )

  // KPIs
  const kpis = computed<Kpi[]>(() => {
    const cur = filteredMetrics.value
    const prev = previousMetrics.value

    const runningNow = instances.filter(i => i.state === 'running').length
    const runningPrev = runningNow - 2

    const curCpu = avg(cur.map(d => d.cpu))
    const prevCpu = avg(prev.map(d => d.cpu))

    const curNet = avg(cur.map(d => d.netGbps))
    const prevNet = avg(prev.map(d => d.netGbps))

    // Total storage in GiB
    const totalGib = storageBreakdown.reduce((s, d) => s + d.gib, 0)
    const prevTotalGib = totalGib * 0.91

    return [
      {
        label: 'Running Instances',
        value: runningNow,
        previousValue: runningPrev,
        format: 'number',
        trend: runningPrev ? ((runningNow - runningPrev) / runningPrev) * 100 : 0,
        sparkline: cur.map(d => 18 + Math.round(d.cpu / 14)),
      },
      {
        label: 'Avg CPU Util',
        value: curCpu,
        previousValue: prevCpu,
        format: 'percent',
        trend: prevCpu ? ((curCpu - prevCpu) / prevCpu) * 100 : 0,
        sparkline: cur.map(d => d.cpu),
      },
      {
        label: 'Network Throughput',
        value: curNet,
        previousValue: prevNet,
        format: 'throughput',
        trend: prevNet ? ((curNet - prevNet) / prevNet) * 100 : 0,
        sparkline: cur.map(d => d.netGbps),
        unit: 'Gbps',
      },
      {
        label: 'Storage Used',
        value: totalGib,
        previousValue: prevTotalGib,
        format: 'bytes',
        trend: prevTotalGib ? ((totalGib - prevTotalGib) / prevTotalGib) * 100 : 0,
        sparkline: cur.map((_, i) => prevTotalGib + ((totalGib - prevTotalGib) * i / cur.length)),
      },
    ]
  })

  // Instance table: filter then sort
  const filteredInstances = computed(() => {
    let rows = selectedProject.value === 'all'
      ? instances
      : instances.filter(i => i.project === selectedProject.value)

    return [...rows].sort((a, b) => {
      const dir = sortDir.value === 'asc' ? 1 : -1
      const key = sortKey.value

      if (key === 'state') {
        return (STATE_ORDER[a.state] - STATE_ORDER[b.state]) * dir
      }
      if (key === 'name' || key === 'project') {
        return a[key].localeCompare(b[key]) * dir
      }
      return ((a[key] as number) - (b[key] as number)) * dir
    })
  })

  function toggleSort(key: SortKey) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'desc'
    }
  }

  // Chart data derived from metrics
  const cpuSeries = computed(() =>
    filteredMetrics.value.map(d => ({ date: d.date, value: d.cpu })),
  )

  const memSeries = computed(() =>
    filteredMetrics.value.map(d => ({ date: d.date, value: d.mem })),
  )

  // Full series for the context chart (always 90 days)
  const allCpuSeries = computed(() =>
    liveSamples.value.map(d => ({ date: d.date, value: d.cpu })),
  )

  const allMemSeries = computed(() =>
    liveSamples.value.map(d => ({ date: d.date, value: d.mem })),
  )

  const sledBarData = computed(() =>
    sledUsage.map(s => ({ label: s.sled, value: s.cpuPct, color: s.color })),
  )

  const sledMultiBarData = computed<BarGroup[]>(() =>
    sledUsage.map(s => ({
      label: s.sled,
      values: [
        { key: 'CPU',  value: s.cpuPct,  color: 'var(--chart-1)' },
        { key: 'Mem',  value: s.memPct,  color: 'var(--chart-2)' },
        { key: 'Disk', value: s.diskPct, color: 'var(--chart-3)' },
      ],
    })),
  )

  const storageDonutData = computed(() =>
    storageBreakdown.map(s => ({ label: s.label, value: s.gib, color: s.color })),
  )

  return {
    period,
    selectedProject,
    sortKey,
    sortDir,
    isLoading,
    isLive: readonly(isLive),
    kpis,
    filteredInstances,
    toggleSort,
    toggleLive,
    cpuSeries,
    memSeries,
    allCpuSeries,
    allMemSeries,
    sledBarData,
    sledMultiBarData,
    storageDonutData,
    heatmapData,
  }
}

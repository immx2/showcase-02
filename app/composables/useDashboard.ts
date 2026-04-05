import {
  metricSamples,
  instances,
  sledUsage,
  sledMetricSeries,
  storageBreakdown,
  storageHistory,
  heatmapData,
  type MetricSample,
  type Instance,
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

// liveSamples and liveInterval are module-level intentionally:
// - liveSamples uses shallowRef + triggerRef for in-place mutation (perf; useState can't replicate this)
// - liveInterval is a non-reactive timer handle, not state
const liveSamples = shallowRef<MetricSample[]>([...metricSamples])
let liveInterval: ReturnType<typeof setInterval> | undefined

export function useDashboard() {
  // useState provides SSR-safe singletons: same key → same ref across all callers
  const period = useState<Period>('dashboard.period', () => '30d')
  const isLive = useState<boolean>('dashboard.isLive', () => false)

  const {
    selectedProject,
    sortKey,
    sortDir,
    filtered: filteredInstances,
    toggleSort,
  } = useTableState<Instance, SortKey>(instances, {
    initialKey: 'cpuPct',
    initialDir: 'desc',
    stateOrder: STATE_ORDER,
    stringKeys: ['name', 'project'],
  })

  function startLive() {
    if (isLive.value) return
    isLive.value = true
    liveInterval = setInterval(() => {
      const buf = liveSamples.value
      const last = buf[buf.length - 1]
      if (!last) return
      const rng = Math.random
      const newCpu  = Math.min(95, Math.max(5,    last.cpu     + (rng() - 0.48) * 6))
      const newMem  = Math.min(92, Math.max(20,   last.mem     + (rng() - 0.45) * 3))
      const newNet  = Math.min(8,  Math.max(0.2,  last.netGbps + (rng() - 0.5)  * 0.3))
      const newDisk = Math.min(30000, Math.max(2000, last.diskIops + (rng() - 0.5) * 800))
      const prevDate = new Date(last.date)
      prevDate.setDate(prevDate.getDate() + 1)
      const now = prevDate
      if (buf.length >= 90) buf.shift()
      buf.push({
        date:     now.toISOString().split('T')[0]!,
        cpu:      Math.round(newCpu * 10) / 10,
        mem:      Math.round(newMem * 10) / 10,
        netGbps:  Math.round(newNet * 100) / 100,
        diskIops: Math.round(newDisk),
      })
      triggerRef(liveSamples)
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

  // KPIs (single-pass over current / previous slices for averages + sparklines)
  const kpis = computed<Kpi[]>(() => {
    const cur = filteredMetrics.value
    const prev = previousMetrics.value

    const runningNow = instances.filter(i => i.state === 'running').length
    const runningPrev = runningNow - 2

    const n = cur.length
    let sumCpu = 0
    let sumNet = 0
    const sparkRunningStyle: number[] = n ? new Array(n) : []
    const sparkCpu: number[] = n ? new Array(n) : []
    const sparkNet: number[] = n ? new Array(n) : []
    for (let i = 0; i < n; i++) {
      const d = cur[i]!
      sumCpu += d.cpu
      sumNet += d.netGbps
      sparkRunningStyle[i] = 18 + Math.round(d.cpu / 14)
      sparkCpu[i] = d.cpu
      sparkNet[i] = d.netGbps
    }
    const curCpu = n ? sumCpu / n : 0
    const curNet = n ? sumNet / n : 0

    const pn = prev.length
    let prevSumCpu = 0
    let prevSumNet = 0
    for (let i = 0; i < pn; i++) {
      const d = prev[i]!
      prevSumCpu += d.cpu
      prevSumNet += d.netGbps
    }
    const prevCpu = pn ? prevSumCpu / pn : 0
    const prevNet = pn ? prevSumNet / pn : 0

    const days = PERIOD_DAYS[period.value]
    const storageWindow = storageHistory.slice(Math.max(0, storageHistory.length - days))
    const totalGib = storageHistory[storageHistory.length - 1]!.totalGib
    const prevTotalGib = storageHistory[Math.max(0, storageHistory.length - 1 - days)]!.totalGib
    const sparkStorage = storageWindow.map(s => s.totalGib)

    return [
      {
        label: 'Running Instances',
        value: runningNow,
        previousValue: runningPrev,
        format: 'number',
        trend: runningPrev ? ((runningNow - runningPrev) / runningPrev) * 100 : 0,
        sparkline: sparkRunningStyle,
      },
      {
        label: 'Avg CPU Util',
        value: curCpu,
        previousValue: prevCpu,
        format: 'percent',
        trend: prevCpu ? ((curCpu - prevCpu) / prevCpu) * 100 : 0,
        sparkline: sparkCpu,
      },
      {
        label: 'Network Throughput',
        value: curNet,
        previousValue: prevNet,
        format: 'throughput',
        trend: prevNet ? ((curNet - prevNet) / prevNet) * 100 : 0,
        sparkline: sparkNet,
        unit: 'Gbps',
      },
      {
        label: 'Storage Used',
        value: totalGib,
        previousValue: prevTotalGib,
        format: 'bytes',
        trend: prevTotalGib ? ((totalGib - prevTotalGib) / prevTotalGib) * 100 : 0,
        sparkline: sparkStorage,
      },
    ]
  })

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

  const sledMultiBarData = computed<BarGroup[]>(() => {
    const days = PERIOD_DAYS[period.value]
    return sledUsage.map(s => {
      const series = sledMetricSeries[s.sled] ?? []
      const window = series.slice(Math.max(0, series.length - days))
      const n = window.length || 1
      let sumCpu = 0, sumMem = 0, sumDisk = 0
      for (const d of window) { sumCpu += d.cpuPct; sumMem += d.memPct; sumDisk += d.diskPct }
      return {
        label: s.sled,
        values: [
          { key: 'CPU',  value: Math.round(sumCpu  / n * 10) / 10, color: 'var(--chart-1)' },
          { key: 'Mem',  value: Math.round(sumMem  / n * 10) / 10, color: 'var(--chart-2)' },
          { key: 'Disk', value: Math.round(sumDisk / n * 10) / 10, color: 'var(--chart-3)' },
        ],
      }
    })
  })

  const storageDonutData = computed(() =>
    storageBreakdown.map(s => ({ label: s.label, value: s.gib, color: s.color })),
  )

  return {
    period,
    selectedProject,
    sortKey,
    sortDir,
    isLive: readonly(isLive),
    kpis,
    filteredInstances,
    toggleSort,
    toggleLive,
    cpuSeries,
    memSeries,
    allCpuSeries,
    allMemSeries,
    sledMultiBarData,
    storageDonutData,
    heatmapData,
  }
}

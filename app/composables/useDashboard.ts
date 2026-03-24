import {
  dailyMetrics,
  trafficSources,
  planRevenue,
  heatmapData,
  type DailyMetric,
} from '~/data/analytics'

export type Period = '7d' | '30d' | '90d' | '12m'

export interface Kpi {
  label: string
  value: number
  previousValue: number
  format: 'currency' | 'number' | 'percent'
  trend: number
  sparkline: number[]
}

const PERIOD_DAYS: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '12m': 365,
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

function slice(metrics: DailyMetric[], days: number): DailyMetric[] {
  return metrics.slice(Math.max(0, metrics.length - days))
}

function prevSlice(metrics: DailyMetric[], days: number): DailyMetric[] {
  const end = Math.max(0, metrics.length - days)
  return metrics.slice(Math.max(0, end - days), end)
}

export function useDashboard() {
  const period = ref<Period>('30d')
  const isLoading = ref(false)

  let loadTimer: ReturnType<typeof setTimeout> | undefined
  watch(period, () => {
    isLoading.value = true
    clearTimeout(loadTimer)
    loadTimer = setTimeout(() => { isLoading.value = false }, 350)
  })

  const filteredMetrics = computed(() =>
    slice(dailyMetrics, PERIOD_DAYS[period.value]),
  )

  const previousMetrics = computed(() =>
    prevSlice(dailyMetrics, PERIOD_DAYS[period.value]),
  )

  const kpis = computed<Kpi[]>(() => {
    const cur = filteredMetrics.value
    const prev = previousMetrics.value

    const curRevenue = sum(cur.map(d => d.revenue))
    const prevRevenue = sum(prev.map(d => d.revenue))

    const curUsers = avg(cur.map(d => d.activeUsers))
    const prevUsers = avg(prev.map(d => d.activeUsers))

    const curConv = avg(cur.map(d => d.conversionRate))
    const prevConv = avg(prev.map(d => d.conversionRate))

    const curSignups = sum(cur.map(d => d.newSignups))
    const prevSignups = sum(prev.map(d => d.newSignups))

    return [
      {
        label: 'Revenue',
        value: curRevenue,
        previousValue: prevRevenue,
        format: 'currency',
        trend: prevRevenue ? ((curRevenue - prevRevenue) / prevRevenue) * 100 : 0,
        sparkline: cur.map(d => d.revenue),
      },
      {
        label: 'Active Users',
        value: curUsers,
        previousValue: prevUsers,
        format: 'number',
        trend: prevUsers ? ((curUsers - prevUsers) / prevUsers) * 100 : 0,
        sparkline: cur.map(d => d.activeUsers),
      },
      {
        label: 'Conversion Rate',
        value: curConv,
        previousValue: prevConv,
        format: 'percent',
        trend: prevConv ? ((curConv - prevConv) / prevConv) * 100 : 0,
        sparkline: cur.map(d => d.conversionRate),
      },
      {
        label: 'New Signups',
        value: curSignups,
        previousValue: prevSignups,
        format: 'number',
        trend: prevSignups ? ((curSignups - prevSignups) / prevSignups) * 100 : 0,
        sparkline: cur.map(d => d.newSignups),
      },
    ]
  })

  return {
    period,
    isLoading,
    filteredMetrics,
    kpis,
    trafficSources,
    planRevenue,
    heatmapData,
  }
}

export interface DailyMetric {
  date: string
  revenue: number
  activeUsers: number
  sessions: number
  newSignups: number
  conversionRate: number
  churnRate: number
}

export interface TrafficSource {
  source: string
  sessions: number
  conversions: number
  revenue: number
  color: string
}

export interface PlanRevenue {
  plan: string
  mrr: number
  users: number
  color: string
}

export interface HeatmapCell {
  day: number
  hour: number
  count: number
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function generateDailyMetrics(): DailyMetric[] {
  const rng = mulberry32(42)
  const data: DailyMetric[] = []
  const start = new Date(2025, 2, 25)

  let baseRevenue = 35200
  let baseUsers = 9100

  for (let i = 0; i < 365; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dow = d.getDay()

    baseRevenue *= 1 + (0.0008 + rng() * 0.0018)
    baseUsers *= 1 + (0.0004 + rng() * 0.0009)

    const weekendFactor = dow === 0 || dow === 6 ? 0.72 + rng() * 0.08 : 1
    const noise = 0.93 + rng() * 0.14

    const revenue = Math.round(baseRevenue * noise * weekendFactor)
    const activeUsers = Math.round(baseUsers * noise * weekendFactor)
    const sessions = Math.round(activeUsers * (1.4 + rng() * 0.6))
    const newSignups = Math.round(activeUsers * (0.018 + rng() * 0.012))

    data.push({
      date: d.toISOString().split('T')[0],
      revenue,
      activeUsers,
      sessions,
      newSignups,
      conversionRate: Math.round((2.4 + rng() * 2.2) * 100) / 100,
      churnRate: Math.round((1.4 + rng() * 1.6) * 100) / 100,
    })
  }

  return data
}

function generateHeatmap(): HeatmapCell[] {
  const rng = mulberry32(99)
  const cells: HeatmapCell[] = []

  for (let day = 0; day < 7; day++) {
    const isWeekend = day >= 5
    for (let hour = 0; hour < 24; hour++) {
      const isPeak = hour >= 9 && hour <= 17
      const isEvening = hour >= 19 && hour <= 22
      const baseLine = isWeekend ? 40 : 80

      let intensity = baseLine
      if (isPeak) intensity = isWeekend ? 120 : 380
      else if (isEvening) intensity = isWeekend ? 100 : 200
      else if (hour < 6) intensity = isWeekend ? 15 : 25

      cells.push({
        day,
        hour,
        count: Math.round(intensity * (0.7 + rng() * 0.6)),
      })
    }
  }
  return cells
}

export const dailyMetrics: DailyMetric[] = generateDailyMetrics()

export const trafficSources: TrafficSource[] = [
  { source: 'Organic Search', sessions: 48420, conversions: 1694, revenue: 18900, color: 'var(--chart-1)' },
  { source: 'Direct',         sessions: 27650, conversions: 1106, revenue: 12400, color: 'var(--chart-2)' },
  { source: 'Referral',       sessions: 20730, conversions: 828,  revenue: 9200,  color: 'var(--chart-3)' },
  { source: 'Paid',           sessions: 12680, conversions: 634,  revenue: 7800,  color: 'var(--chart-4)' },
  { source: 'Social',         sessions: 5760,  conversions: 230,  revenue: 2600,  color: 'var(--chart-5)' },
]

export const planRevenue: PlanRevenue[] = [
  { plan: 'Starter',    mrr: 19720, users: 680, color: 'var(--chart-1)' },
  { plan: 'Pro',        mrr: 23760, users: 240, color: 'var(--chart-2)' },
  { plan: 'Enterprise', mrr: 8372,  users: 28,  color: 'var(--chart-3)' },
]

export const heatmapData: HeatmapCell[] = generateHeatmap()

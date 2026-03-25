<script setup lang="ts">
import * as d3 from 'd3'

interface DataPoint {
  date: string
  value: number
}

interface SeriesMeta {
  label: string
  color: string
}

const props = withDefaults(defineProps<{
  data: DataPoint[]
  data2?: DataPoint[]
  fullData?: DataPoint[]    // full dataset for context/brush minimap
  fullData2?: DataPoint[]
  color?: string
  color2?: string
  seriesMeta?: [SeriesMeta, SeriesMeta]
  formatValue?: (v: number) => string
  height?: number
}>(), {
  color: 'var(--chart-1)',
  color2: 'var(--chart-2)',
  height: 260,
  formatValue: (v: number) => `${v.toFixed(1)}%`,
})

const emit = defineEmits<{
  'update:brushRange': [range: [Date, Date] | null]
}>()

const containerRef = ref<HTMLElement>()
const xAxisRef    = ref<SVGGElement>()
const yAxisRef    = ref<SVGGElement>()
const ctxXAxisRef = ref<SVGGElement>()
const brushGroupRef = ref<SVGGElement>()

const { width: cw } = useElementSize(containerRef)
const uid         = useId()
const gradientId  = computed(() => `line-grad-${uid}`)
const gradient2Id = computed(() => `line-grad2-${uid}`)
const clipId      = computed(() => `line-clip-${uid}`)

// Context chart constants
const CTX_H   = 28 // context inner height
const CTX_GAP = 10 // gap between focus x-axis and context chart
const CTX_BOT = 20 // space for context x-axis
const CTX_TOTAL = CTX_H + CTX_GAP + CTX_BOT

const hasContext = computed(() => !!props.fullData?.length)

const margin = { top: 12, right: 16, bottom: 32, left: 44 }
const innerWidth  = computed(() => Math.max(cw.value - margin.left - margin.right, 0))
const focusHeight = computed(() => props.height - margin.top - margin.bottom)

// Context group y-origin (inside same SVG)
const ctxOriginY = computed(() =>
  margin.top + focusHeight.value + margin.bottom + CTX_GAP,
)

// Total SVG height
const totalSvgHeight = computed(() =>
  hasContext.value
    ? props.height + CTX_GAP + CTX_H + CTX_BOT
    : props.height,
)

// ── Parsed data ──────────────────────────────────────────────────────────────

const parsed = computed(() =>
  props.data.map(d => ({ date: new Date(d.date), value: d.value })),
)

const parsed2 = computed(() =>
  props.data2?.map(d => ({ date: new Date(d.date), value: d.value })) ?? [],
)

const fullParsed = computed(() =>
  props.fullData?.map(d => ({ date: new Date(d.date), value: d.value })) ?? parsed.value,
)

const fullParsed2 = computed(() =>
  props.fullData2?.map(d => ({ date: new Date(d.date), value: d.value })) ?? parsed2.value,
)

// ── Brush state ──────────────────────────────────────────────────────────────

const brushRange = ref<[Date, Date] | null>(null)

function clearBrush() {
  brushRange.value = null
  emit('update:brushRange', null)
  if (brushGroupRef.value) {
    d3.select(brushGroupRef.value).call(
      d3.brushX().extent([[0, 0], [innerWidth.value, CTX_H]]).move,
      null,
    )
  }
}

// ── Focus scales (use brushRange domain when active) ─────────────────────────

const focusXScale = computed(() => {
  const domain = brushRange.value
    ?? (d3.extent(parsed.value, d => d.date) as [Date, Date])
  return d3.scaleTime().domain(domain).range([0, innerWidth.value])
})

const focusYScale = computed(() => {
  const allValues = [
    ...parsed.value.map(d => d.value),
    ...parsed2.value.map(d => d.value),
  ]
  return d3.scaleLinear()
    .domain([0, (d3.max(allValues) ?? 100) * 1.08])
    .range([focusHeight.value, 0])
    .nice()
})

// ── Context scales (always full dataset) ─────────────────────────────────────

const ctxXScale = computed(() =>
  d3.scaleTime()
    .domain(d3.extent(fullParsed.value, d => d.date) as [Date, Date])
    .range([0, innerWidth.value]),
)

const ctxYScale = computed(() => {
  const allValues = [
    ...fullParsed.value.map(d => d.value),
    ...fullParsed2.value.map(d => d.value),
  ]
  return d3.scaleLinear()
    .domain([0, (d3.max(allValues) ?? 100) * 1.1])
    .range([CTX_H, 0])
    .nice()
})

// ── Path builders ─────────────────────────────────────────────────────────────

type Pt = { date: Date; value: number }

function buildLine(series: Pt[], xs: d3.ScaleTime<number, number>, ys: d3.ScaleLinear<number, number>, h: number) {
  return d3.line<Pt>().x(d => xs(d.date)).y(d => ys(d.value)).curve(d3.curveMonotoneX)(series) ?? ''
}

function buildArea(series: Pt[], xs: d3.ScaleTime<number, number>, ys: d3.ScaleLinear<number, number>, h: number) {
  return d3.area<Pt>().x(d => xs(d.date)).y0(h).y1(d => ys(d.value)).curve(d3.curveMonotoneX)(series) ?? ''
}

const linePath  = computed(() => buildLine(parsed.value,  focusXScale.value, focusYScale.value, focusHeight.value))
const areaPath  = computed(() => buildArea(parsed.value,  focusXScale.value, focusYScale.value, focusHeight.value))
const line2Path = computed(() => parsed2.value.length ? buildLine(parsed2.value, focusXScale.value, focusYScale.value, focusHeight.value) : '')
const area2Path = computed(() => parsed2.value.length ? buildArea(parsed2.value, focusXScale.value, focusYScale.value, focusHeight.value) : '')

const ctxLinePath  = computed(() => buildLine(fullParsed.value,  ctxXScale.value, ctxYScale.value, CTX_H))
const ctxLine2Path = computed(() => fullParsed2.value.length ? buildLine(fullParsed2.value, ctxXScale.value, ctxYScale.value, CTX_H) : '')

// Highlight rect within context showing current period
const periodX1 = computed(() => {
  const first = parsed.value[0]
  return first ? ctxXScale.value(first.date) : 0
})
const periodX2 = computed(() => {
  const last = parsed.value[parsed.value.length - 1]
  return last ? ctxXScale.value(last.date) : innerWidth.value
})

// Stable fingerprints so we do not watch D3 scale identities (new object every tick).
function maxValueInSeries(pts: Pt[]): number {
  let m = 0
  for (const p of pts) {
    if (p.value > m) m = p.value
  }
  return m
}

const focusAxisFingerprint = computed(() => {
  const p = parsed.value
  const p2 = parsed2.value
  const br = brushRange.value
  return [
    innerWidth.value,
    p.length,
    p[0]?.date ?? '',
    p[p.length - 1]?.date ?? '',
    Math.max(maxValueInSeries(p), maxValueInSeries(p2)),
    br ? `${+br[0]},${+br[1]}` : '',
  ].join('|')
})

const ctxBrushFingerprint = computed(() => {
  const fp = fullParsed.value
  const fp2 = fullParsed2.value
  return [
    innerWidth.value,
    fp.length,
    fp[0]?.date ?? '',
    fp[fp.length - 1]?.date ?? '',
    Math.max(maxValueInSeries(fp), maxValueInSeries(fp2)),
  ].join('|')
})

let chartRaf = 0
let chartNeedsBrush = false
function scheduleChartUpdate(needsBrush: boolean) {
  if (needsBrush) chartNeedsBrush = true
  if (chartRaf) return
  chartRaf = requestAnimationFrame(() => {
    chartRaf = 0
    renderAxes()
    if (chartNeedsBrush && hasContext.value) initBrush()
    chartNeedsBrush = false
  })
}

// ── Brush init ────────────────────────────────────────────────────────────────

function initBrush() {
  if (!brushGroupRef.value || !hasContext.value || innerWidth.value <= 0) return

  const brush = d3.brushX<unknown>()
    .extent([[0, 0], [innerWidth.value, CTX_H]])
    .on('end', (event: d3.D3BrushEvent<unknown>) => {
      if (!event.selection) {
        brushRange.value = null
        emit('update:brushRange', null)
        return
      }
      const [x0, x1] = event.selection as [number, number]
      const newRange: [Date, Date] = [
        ctxXScale.value.invert(x0),
        ctxXScale.value.invert(x1),
      ]
      brushRange.value = newRange
      emit('update:brushRange', newRange)
    })

  const g = d3.select(brushGroupRef.value)
  g.call(brush)

  // Style the brush
  g.select<SVGRectElement>('.selection')
    .attr('fill', 'var(--color-accent)')
    .attr('fill-opacity', 0.18)
    .attr('stroke', 'var(--color-accent)')
    .attr('stroke-width', 1)
    .attr('rx', 2)

  g.selectAll<SVGRectElement, unknown>('.handle')
    .attr('fill', 'var(--color-accent)')
    .attr('rx', 2)
}

// ── Axes ──────────────────────────────────────────────────────────────────────

function renderAxes() {
  if (!xAxisRef.value || !yAxisRef.value || innerWidth.value <= 0) return

  const ticks = innerWidth.value > 500 ? 6 : 3

  d3.select(xAxisRef.value)
    .call(
      d3.axisBottom(focusXScale.value)
        .ticks(ticks)
        .tickFormat(d => d3.timeFormat('%b %d')(d as Date))
        .tickSize(0)
        .tickPadding(10),
    )
    .call(g => g.select('.domain').remove())

  d3.select(yAxisRef.value)
    .call(
      d3.axisLeft(focusYScale.value)
        .ticks(5)
        .tickFormat(d => props.formatValue(d as number))
        .tickSize(0)
        .tickPadding(8),
    )
    .call(g => g.select('.domain').remove())
    .call(g =>
      g.selectAll('.tick line')
        .clone()
        .attr('x2', innerWidth.value)
        .attr('stroke', 'var(--color-border-subtle)')
        .attr('stroke-opacity', 0.6),
    )

  if (ctxXAxisRef.value && hasContext.value) {
    d3.select(ctxXAxisRef.value)
      .call(
        d3.axisBottom(ctxXScale.value)
          .ticks(4)
          .tickFormat(d => d3.timeFormat('%b %d')(d as Date))
          .tickSize(0)
          .tickPadding(6),
      )
      .call(g => g.select('.domain').remove())
  }
}

onMounted(() => {
  renderAxes()
  initBrush()
})

watch(focusAxisFingerprint, () => scheduleChartUpdate(false))
watch(ctxBrushFingerprint, () => scheduleChartUpdate(true))

onUnmounted(() => {
  if (chartRaf) {
    cancelAnimationFrame(chartRaf)
    chartRaf = 0
  }
})

// ── Tooltip ───────────────────────────────────────────────────────────────────

const tooltip = reactive({ show: false, x: 0, y: 0, date: '', value: '', value2: '' })
const bisectDate = d3.bisector<Pt, Date>(d => d.date).left

function onMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect()
  const mx   = e.clientX - rect.left
  const date = focusXScale.value.invert(mx)
  const idx  = Math.min(bisectDate(parsed.value, date), parsed.value.length - 1)
  const d    = parsed.value[idx]
  if (!d) return

  tooltip.show   = true
  tooltip.x      = focusXScale.value(d.date) + margin.left
  tooltip.y      = focusYScale.value(d.value) + margin.top
  tooltip.date   = d3.timeFormat('%b %d, %Y')(d.date)
  tooltip.value  = props.formatValue(d.value)
  tooltip.value2 = parsed2.value[idx] ? props.formatValue(parsed2.value[idx].value) : ''
}

function onMouseLeave() { tooltip.show = false }

// Brush date label
const brushLabel = computed(() => {
  if (!brushRange.value) return ''
  const fmt = d3.timeFormat('%b %d')
  return `${fmt(brushRange.value[0])} – ${fmt(brushRange.value[1])}`
})
</script>

<template>
  <div ref="containerRef" class="line-chart-wrap">
    <!-- Legend + brush reset -->
    <div class="chart-top-bar">
      <div v-if="seriesMeta" class="legend">
        <span v-for="(s, i) in seriesMeta" :key="s.label" class="legend-item">
          <span class="legend-swatch" :style="{ background: i === 0 ? color : color2 }" :class="i === 1 ? 'dashed' : ''" />
          {{ s.label }}
        </span>
      </div>
      <div v-else class="legend" />

      <Transition name="fade">
        <button v-if="brushRange" class="reset-btn" @click="clearBrush">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          {{ brushLabel }} — Reset zoom
        </button>
      </Transition>
    </div>

    <svg :width="cw" :height="totalSvgHeight">
      <defs>
        <clipPath :id="clipId">
          <rect :width="innerWidth" :height="focusHeight" />
        </clipPath>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.18" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.01" />
        </linearGradient>
        <linearGradient v-if="data2" :id="gradient2Id" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color2" stop-opacity="0.12" />
          <stop offset="100%" :stop-color="color2" stop-opacity="0.01" />
        </linearGradient>
      </defs>

      <!-- ── Focus chart ── -->
      <g :transform="`translate(${margin.left},${margin.top})`">
        <g ref="yAxisRef" class="axis" />
        <g ref="xAxisRef" class="axis" :transform="`translate(0,${focusHeight})`" />

        <g :clip-path="`url(#${clipId})`">
          <path :d="areaPath" :fill="`url(#${gradientId})`" />
          <path :d="linePath" fill="none" :stroke="color" stroke-width="1.5" class="line-path" />

          <template v-if="data2 && data2.length">
            <path :d="area2Path" :fill="`url(#${gradient2Id})`" />
            <path :d="line2Path" fill="none" :stroke="color2" stroke-width="1.5" stroke-dasharray="4 3" class="line-path" />
          </template>
        </g>

        <!-- Crosshair dot -->
        <circle
          v-if="tooltip.show"
          :cx="tooltip.x - margin.left"
          :cy="tooltip.y - margin.top"
          r="3"
          :fill="color"
          stroke="var(--color-surface)"
          stroke-width="1.5"
        />

        <rect
          :width="innerWidth"
          :height="focusHeight"
          fill="transparent"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
        />
      </g>

      <!-- ── Context chart (minimap + brush) ── -->
      <g
        v-if="hasContext"
        :transform="`translate(${margin.left},${ctxOriginY})`"
      >
        <!-- Context line(s) -->
        <path :d="ctxLinePath" fill="none" :stroke="color" stroke-width="1" opacity="0.5" />
        <path v-if="fullData2?.length" :d="ctxLine2Path" fill="none" :stroke="color2" stroke-width="1" opacity="0.4" />

        <!-- Period highlight band (shows current filter relative to full data) -->
        <rect
          v-if="!brushRange"
          :x="periodX1"
          y="0"
          :width="Math.max(0, periodX2 - periodX1)"
          :height="CTX_H"
          fill="var(--color-accent)"
          fill-opacity="0.08"
          rx="2"
        />

        <!-- Context x-axis -->
        <g ref="ctxXAxisRef" class="axis ctx-axis" :transform="`translate(0,${CTX_H})`" />

        <!-- Brush overlay -->
        <g ref="brushGroupRef" class="brush-group" />
      </g>
    </svg>

    <!-- Tooltip -->
    <div
      v-if="tooltip.show"
      class="tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y - 12}px` }"
    >
      <span class="tooltip-date">{{ tooltip.date }}</span>
      <span class="tooltip-row">
        <span class="tooltip-dot" :style="{ background: color }" />
        {{ tooltip.value }}
        <template v-if="tooltip.value2">
          <span class="tooltip-sep">·</span>
          <span class="tooltip-dot" :style="{ background: color2 }" />
          {{ tooltip.value2 }}
        </template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.line-chart-wrap {
  position: relative;
  width: 100%;
}

.line-chart-wrap :deep(.axis text) {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
}

.line-chart-wrap :deep(.ctx-axis text) {
  font-size: 10px;
}

.line-path { vector-effect: non-scaling-stroke; }

/* Top bar: legend + reset button */
.chart-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  min-height: 20px;
}

/* Legend */
.legend {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.legend-swatch {
  width: 18px;
  height: 2px;
  border-radius: 1px;
  flex-shrink: 0;
}

.legend-swatch.dashed {
  background: none !important;
  border-top: 2px dashed var(--chart-2);
  height: 0;
  padding-top: 1px;
}

/* Reset zoom button */
.reset-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 22px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.reset-btn:hover {
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

/* Brush styling overrides (deep because D3 generates these) */
.line-chart-wrap :deep(.brush-group .overlay) {
  fill: var(--color-border-subtle);
  fill-opacity: 0.3;
  rx: 2;
  cursor: crosshair;
}

.line-chart-wrap :deep(.brush-group .selection) {
  fill: var(--color-accent);
  fill-opacity: 0.18;
  stroke: var(--color-accent);
  stroke-width: 1;
}

.line-chart-wrap :deep(.brush-group .handle) {
  fill: var(--color-accent);
}

/* Tooltip */
.tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  z-index: 10;
}

.tooltip-date {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
}

.tooltip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tooltip-sep { color: var(--color-text-muted); }

/* Fade transition for reset button */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

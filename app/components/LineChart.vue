<script setup lang="ts">
import * as d3 from 'd3'
import { useElementSize } from '@vueuse/core'

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

const containerRef = ref<HTMLElement>()
const xAxisRef = ref<SVGGElement>()
const yAxisRef = ref<SVGGElement>()

const { width: cw } = useElementSize(containerRef)
const uid = useId()
const gradientId = computed(() => `line-grad-${uid}`)
const gradient2Id = computed(() => `line-grad2-${uid}`)

const margin = { top: 12, right: 16, bottom: 32, left: 44 }
const width = computed(() => Math.max(cw.value - margin.left - margin.right, 0))
const height = computed(() => props.height - margin.top - margin.bottom)

const parsed = computed(() =>
  props.data.map(d => ({ date: new Date(d.date), value: d.value })),
)

const parsed2 = computed(() =>
  props.data2?.map(d => ({ date: new Date(d.date), value: d.value })) ?? [],
)

const xScale = computed(() =>
  d3.scaleTime()
    .domain(d3.extent(parsed.value, d => d.date) as [Date, Date])
    .range([0, width.value]),
)

const yScale = computed(() => {
  const allValues = [
    ...parsed.value.map(d => d.value),
    ...parsed2.value.map(d => d.value),
  ]
  return d3.scaleLinear()
    .domain([0, (d3.max(allValues) ?? 100) * 1.08])
    .range([height.value, 0])
    .nice()
})

function buildLine(series: { date: Date; value: number }[]) {
  return d3.line<{ date: Date; value: number }>()
    .x(d => xScale.value(d.date))
    .y(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX)(series) ?? ''
}

function buildArea(series: { date: Date; value: number }[]) {
  return d3.area<{ date: Date; value: number }>()
    .x(d => xScale.value(d.date))
    .y0(height.value)
    .y1(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX)(series) ?? ''
}

const linePath = computed(() => buildLine(parsed.value))
const areaPath = computed(() => buildArea(parsed.value))
const line2Path = computed(() => parsed2.value.length ? buildLine(parsed2.value) : '')
const area2Path = computed(() => parsed2.value.length ? buildArea(parsed2.value) : '')

// Tooltip
const tooltip = reactive({ show: false, x: 0, y: 0, date: '', value: '', value2: '' })
const bisector = d3.bisector<{ date: Date; value: number }, Date>(d => d.date).left

function onMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect()
  const mx = e.clientX - rect.left
  const date = xScale.value.invert(mx)
  const idx = Math.min(bisector(parsed.value, date), parsed.value.length - 1)
  const d = parsed.value[idx]
  if (!d) return

  tooltip.show = true
  tooltip.x = xScale.value(d.date) + margin.left
  tooltip.y = yScale.value(d.value) + margin.top
  tooltip.date = d3.timeFormat('%b %d, %Y')(d.date)
  tooltip.value = props.formatValue(d.value)
  if (parsed2.value[idx]) {
    tooltip.value2 = props.formatValue(parsed2.value[idx].value)
  }
}

function onMouseLeave() { tooltip.show = false }

function renderAxes() {
  if (!xAxisRef.value || !yAxisRef.value || width.value <= 0) return
  const ticks = width.value > 500 ? 6 : 3

  d3.select(xAxisRef.value)
    .call(
      d3.axisBottom(xScale.value)
        .ticks(ticks)
        .tickFormat(d => d3.timeFormat('%b %d')(d as Date))
        .tickSize(0)
        .tickPadding(10),
    )
    .call(g => g.select('.domain').remove())

  d3.select(yAxisRef.value)
    .call(
      d3.axisLeft(yScale.value)
        .ticks(5)
        .tickFormat(d => props.formatValue(d as number))
        .tickSize(0)
        .tickPadding(8),
    )
    .call(g => g.select('.domain').remove())
    .call(g =>
      g.selectAll('.tick line')
        .clone()
        .attr('x2', width.value)
        .attr('stroke', 'var(--color-border-subtle)')
        .attr('stroke-opacity', 0.6),
    )
}

onMounted(renderAxes)
watch([xScale, yScale], renderAxes)
</script>

<template>
  <div ref="containerRef" class="line-chart-wrap">
    <!-- Legend for dual series -->
    <div v-if="seriesMeta" class="legend">
      <span v-for="(s, i) in seriesMeta" :key="s.label" class="legend-item">
        <span class="legend-swatch" :style="{ background: i === 0 ? color : color2 }" :class="i === 1 ? 'dashed' : ''" />
        {{ s.label }}
      </span>
    </div>

    <svg :width="cw" :height="height">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.18" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.01" />
        </linearGradient>
        <linearGradient v-if="data2" :id="gradient2Id" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color2" stop-opacity="0.12" />
          <stop offset="100%" :stop-color="color2" stop-opacity="0.01" />
        </linearGradient>
      </defs>

      <g :transform="`translate(${margin.left},${margin.top})`">
        <g ref="yAxisRef" class="axis" />
        <g ref="xAxisRef" class="axis" :transform="`translate(0,${height})`" />

        <!-- Series 1: area + line -->
        <path :d="areaPath" :fill="`url(#${gradientId})`" />
        <path :d="linePath" fill="none" :stroke="color" stroke-width="1.5" class="line-path" />

        <!-- Series 2: area + dashed line -->
        <template v-if="data2 && data2.length">
          <path :d="area2Path" :fill="`url(#${gradient2Id})`" />
          <path :d="line2Path" fill="none" :stroke="color2" stroke-width="1.5" stroke-dasharray="4 3" class="line-path" />
        </template>

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

        <rect :width="width" :height="height" fill="transparent" @mousemove="onMouseMove" @mouseleave="onMouseLeave" />
      </g>
    </svg>

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

.line-path { vector-effect: non-scaling-stroke; }

/* Legend */
.legend {
  display: flex;
  gap: var(--space-5);
  margin-bottom: var(--space-3);
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
</style>

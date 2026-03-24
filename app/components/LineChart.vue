<script setup lang="ts">
import * as d3 from 'd3'
import { useElementSize } from '@vueuse/core'

interface DataPoint {
  date: string
  value: number
}

const props = withDefaults(defineProps<{
  data: DataPoint[]
  color?: string
  formatValue?: (v: number) => string
  height?: number
}>(), {
  color: 'var(--chart-1)',
  height: 260,
  formatValue: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v),
})

const containerRef = ref<HTMLElement>()
const xAxisRef = ref<SVGGElement>()
const yAxisRef = ref<SVGGElement>()

const { width: cw } = useElementSize(containerRef)
const uid = useId()
const gradientId = computed(() => `line-grad-${uid}`)

const margin = { top: 12, right: 16, bottom: 32, left: 52 }
const width = computed(() => Math.max(cw.value - margin.left - margin.right, 0))
const height = computed(() => props.height - margin.top - margin.bottom)

const parsed = computed(() =>
  props.data.map(d => ({ date: new Date(d.date), value: d.value })),
)

const xScale = computed(() =>
  d3.scaleTime()
    .domain(d3.extent(parsed.value, d => d.date) as [Date, Date])
    .range([0, width.value]),
)

const yScale = computed(() =>
  d3.scaleLinear()
    .domain([0, (d3.max(parsed.value, d => d.value) ?? 0) * 1.08])
    .range([height.value, 0])
    .nice(),
)

const linePath = computed(() =>
  d3.line<{ date: Date; value: number }>()
    .x(d => xScale.value(d.date))
    .y(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX)(parsed.value) ?? '',
)

const areaPath = computed(() =>
  d3.area<{ date: Date; value: number }>()
    .x(d => xScale.value(d.date))
    .y0(height.value)
    .y1(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX)(parsed.value) ?? '',
)

const tooltip = reactive({
  show: false,
  x: 0,
  y: 0,
  date: '',
  value: '',
})

const bisector = d3.bisector<{ date: Date; value: number }, Date>(d => d.date).left

function onMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect()
  const mx = e.clientX - rect.left
  const date = xScale.value.invert(mx)
  const idx = Math.min(
    bisector(parsed.value, date),
    parsed.value.length - 1,
  )
  const d = parsed.value[idx]
  if (!d) return

  tooltip.show = true
  tooltip.x = xScale.value(d.date) + margin.left
  tooltip.y = yScale.value(d.value) + margin.top
  tooltip.date = d3.timeFormat('%b %d, %Y')(d.date)
  tooltip.value = props.formatValue(d.value)
}

function onMouseLeave() {
  tooltip.show = false
}

function renderAxes() {
  if (!xAxisRef.value || !yAxisRef.value || width.value <= 0) return

  const ticks = width.value > 400 ? 6 : 3

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
    .call(g => g.selectAll('.tick line')
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
    <svg :width="cw" :height="props.height">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.2" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      <g :transform="`translate(${margin.left},${margin.top})`">
        <g ref="yAxisRef" class="axis" />
        <g ref="xAxisRef" class="axis" :transform="`translate(0,${height})`" />
        <path class="area-fill" :d="areaPath" :fill="`url(#${gradientId})`" />
        <path class="line-path" :d="linePath" fill="none" :stroke="color" stroke-width="2" />

        <circle
          v-if="tooltip.show"
          :cx="tooltip.x - margin.left"
          :cy="tooltip.y - margin.top"
          r="4"
          :fill="color"
          stroke="var(--color-surface)"
          stroke-width="2"
        />

        <rect
          :width="width"
          :height="height"
          fill="transparent"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
        />
      </g>
    </svg>

    <div
      v-if="tooltip.show"
      class="tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y - 12}px` }"
    >
      <strong>{{ tooltip.value }}</strong>
      <span>{{ tooltip.date }}</span>
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
  font-size: 11px;
  font-family: 'Inter', system-ui, sans-serif;
}

.line-chart-wrap :deep(.axis .tick line) {
  stroke: var(--color-border-subtle);
}

.line-path {
  vector-effect: non-scaling-stroke;
}

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
  align-items: center;
  gap: 2px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  z-index: 10;
}

.tooltip strong {
  font-size: 13px;
  font-weight: 600;
}

.tooltip span {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>

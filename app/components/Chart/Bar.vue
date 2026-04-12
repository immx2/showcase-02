<script setup lang="ts">
import * as d3 from 'd3'
import ChartBarTooltipContent from './BarTooltipContent.vue'

interface BarDatum {
  label: string
  value: number
  color: string
}

interface BarGroupValue {
  key: string
  value: number
  color: string
}

interface BarGroup {
  label: string
  values: BarGroupValue[]
}

const props = withDefaults(defineProps<{
  data?: BarDatum[]
  groups?: BarGroup[]
  formatValue?: (v: number) => string
  height?: number
}>(), {
  data: undefined,
  groups: undefined,
  height: 260,
  formatValue: (v: number) => `${v}%`,
})

const containerRef = ref<HTMLElement>()
const xAxisRef = ref<SVGGElement>()
const { width: cw } = useElementSize(containerRef)

const margin = { top: 24, right: 16, bottom: 32, left: 16 }
const innerWidth = computed(() => Math.max(cw.value - margin.left - margin.right, 0))
const innerHeight = computed(() => props.height - margin.top - margin.bottom)

const isGrouped = computed(() => !!props.groups?.length)

// ── Single-series ───────────────────────────────────────────────────────────

const xScale = computed(() =>
  d3.scaleBand()
    .domain((props.data ?? []).map(d => d.label))
    .range([0, innerWidth.value])
    .padding(0.35),
)

const yScaleSingle = computed(() =>
  d3.scaleLinear()
    .domain([0, (d3.max(props.data ?? [], d => d.value) ?? 0) * 1.15])
    .range([innerHeight.value, 0])
    .nice(),
)

const bars = computed(() =>
  (props.data ?? []).map(d => ({
    ...d,
    x: xScale.value(d.label) ?? 0,
    y: yScaleSingle.value(d.value),
    w: xScale.value.bandwidth(),
    h: innerHeight.value - yScaleSingle.value(d.value),
  })),
)

// ── Grouped mode ────────────────────────────────────────────────────────────

const x0Scale = computed(() =>
  d3.scaleBand()
    .domain((props.groups ?? []).map(g => g.label))
    .range([0, innerWidth.value])
    .padding(0.22),
)

const x1Scale = computed(() => {
  const keys = props.groups?.[0]?.values.map(v => v.key) ?? []
  return d3.scaleBand()
    .domain(keys)
    .range([0, x0Scale.value.bandwidth()])
    .padding(0.06)
})

const yScaleGrouped = computed(() => {
  const allValues = (props.groups ?? []).flatMap(g => g.values.map(v => v.value))
  return d3.scaleLinear()
    .domain([0, (d3.max(allValues) ?? 0) * 1.15])
    .range([innerHeight.value, 0])
    .nice()
})

const groupedBars = computed(() =>
  (props.groups ?? []).map(group => ({
    label: group.label,
    gx: x0Scale.value(group.label) ?? 0,
    bars: group.values.map(v => ({
      ...v,
      bx: x1Scale.value(v.key) ?? 0,
      bw: x1Scale.value.bandwidth(),
      by: yScaleGrouped.value(v.value),
      bh: innerHeight.value - yScaleGrouped.value(v.value),
    })),
  })),
)

const legend = computed(() =>
  props.groups?.[0]?.values.map(v => ({ key: v.key, color: v.color })) ?? [],
)

// ── Axis ────────────────────────────────────────────────────────────────────

function renderAxis() {
  if (!xAxisRef.value) return
  const scale = isGrouped.value ? x0Scale.value : xScale.value
  d3.select(xAxisRef.value)
    .call(d3.axisBottom(scale).tickSize(0).tickPadding(10))
    .call(g => g.select('.domain').remove())
}

const appeared = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { appeared.value = true })
  renderAxis()
})

watch([xScale, x0Scale, isGrouped], renderAxis)

// ── Tooltip ─────────────────────────────────────────────────────────────────

const { show: showTip, hide: hideTip } = useTooltip()

function onBarEnter(x: number, y: number, label: string, value: number, key?: string, color?: string) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  showTip({
    is: ChartBarTooltipContent,
    props: {
      label,
      subLabel: key,
      value: props.formatValue(value),
      color: color ?? '',
    },
  }, rect.left + x + margin.left, rect.top + y + margin.top - 8)
}

function onBarLeave() {
  hideTip()
}
</script>

<template>
  <div ref="containerRef" class="bar-chart-wrap">
    <div v-if="isGrouped && legend.length" class="legend">
      <span v-for="item in legend" :key="item.key" class="legend-item">
        <span class="legend-dot" :style="{ background: item.color }" />
        {{ item.key }}
      </span>
    </div>

    <svg :width="cw" :height="props.height">
      <g :transform="`translate(${margin.left},${margin.top})`">
        <g ref="xAxisRef" class="axis" :transform="`translate(0,${innerHeight})`" />

        <!-- Single-series bars -->
        <template v-if="!isGrouped">
          <g v-for="bar in bars" :key="bar.label">
            <rect
              :x="bar.x"
              :y="appeared ? bar.y : innerHeight"
              :width="bar.w"
              :height="appeared ? bar.h : 0"
              :fill="bar.color"
              rx="4"
              class="bar-rect"
              @mouseenter="onBarEnter(bar.x + bar.w / 2, bar.y, bar.label, bar.value, undefined, bar.color)"
              @mouseleave="onBarLeave"
            />
            <text
              :x="bar.x + bar.w / 2"
              :y="(appeared ? bar.y : innerHeight) - 6"
              text-anchor="middle"
              class="bar-label"
            >
              {{ formatValue(bar.value) }}
            </text>
          </g>
        </template>

        <!-- Grouped bars -->
        <template v-else>
          <g
            v-for="group in groupedBars"
            :key="group.label"
            :transform="`translate(${group.gx}, 0)`"
          >
            <rect
              v-for="bar in group.bars"
              :key="bar.key"
              :x="bar.bx"
              :y="appeared ? bar.by : innerHeight"
              :width="bar.bw"
              :height="appeared ? bar.bh : 0"
              :fill="bar.color"
              rx="3"
              class="bar-rect"
              @mouseenter="onBarEnter(group.gx + bar.bx + bar.bw / 2, bar.by, group.label, bar.value, bar.key, bar.color)"
              @mouseleave="onBarLeave"
            />
          </g>
        </template>
      </g>
    </svg>

  </div>
</template>

<style scoped>
.bar-chart-wrap {
  position: relative;
  width: 100%;
}

.bar-chart-wrap svg {
  max-width: 100%;
  display: block;
}

.bar-chart-wrap :deep(.axis text) {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
}

.bar-rect {
  transition: y var(--motion-chart-draw),
              height var(--motion-chart-draw);
  cursor: pointer;
}

.bar-rect:hover {
  filter: brightness(1.15);
}

.bar-label {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  transition: y var(--motion-chart-draw);
}

.legend {
  display: flex;
  gap: var(--space-4);
  padding: 0 var(--space-4);
  padding-top: var(--space-2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

</style>

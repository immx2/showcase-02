<script setup lang="ts">
import * as d3 from 'd3'
import { useElementSize } from '@vueuse/core'

interface BarDatum {
  label: string
  value: number
  color: string
}

const props = withDefaults(defineProps<{
  data: BarDatum[]
  formatValue?: (v: number) => string
  height?: number
}>(), {
  height: 260,
  formatValue: (v: number) => `${v}%`,
})

const containerRef = ref<HTMLElement>()
const xAxisRef = ref<SVGGElement>()
const { width: cw } = useElementSize(containerRef)

const margin = { top: 24, right: 16, bottom: 32, left: 16 }
const width = computed(() => Math.max(cw.value - margin.left - margin.right, 0))
const height = computed(() => props.height - margin.top - margin.bottom)

const xScale = computed(() =>
  d3.scaleBand()
    .domain(props.data.map(d => d.label))
    .range([0, width.value])
    .padding(0.35),
)

const yScale = computed(() =>
  d3.scaleLinear()
    .domain([0, (d3.max(props.data, d => d.value) ?? 0) * 1.15])
    .range([height.value, 0])
    .nice(),
)

const bars = computed(() =>
  props.data.map(d => ({
    ...d,
    x: xScale.value(d.label) ?? 0,
    y: yScale.value(d.value),
    w: xScale.value.bandwidth(),
    h: height.value - yScale.value(d.value),
  })),
)

const appeared = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { appeared.value = true })

  if (xAxisRef.value) {
    d3.select(xAxisRef.value)
      .call(d3.axisBottom(xScale.value).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').remove())
  }
})

watch(xScale, () => {
  if (!xAxisRef.value) return
  d3.select(xAxisRef.value)
    .call(d3.axisBottom(xScale.value).tickSize(0).tickPadding(10))
    .call(g => g.select('.domain').remove())
})

const tooltip = reactive({ show: false, x: 0, y: 0, label: '', value: '' })

function onBarEnter(bar: (typeof bars.value)[0]) {
  tooltip.show = true
  tooltip.x = bar.x + bar.w / 2 + margin.left
  tooltip.y = bar.y + margin.top - 8
  tooltip.label = bar.label
  tooltip.value = props.formatValue(bar.value)
}

function onBarLeave() {
  tooltip.show = false
}
</script>

<template>
  <div ref="containerRef" class="bar-chart-wrap">
    <svg :width="cw" :height="props.height">
      <g :transform="`translate(${margin.left},${margin.top})`">
        <g ref="xAxisRef" class="axis" :transform="`translate(0,${height})`" />

        <g v-for="bar in bars" :key="bar.label">
          <rect
            :x="bar.x"
            :y="appeared ? bar.y : height"
            :width="bar.w"
            :height="appeared ? bar.h : 0"
            :fill="bar.color"
            rx="4"
            class="bar-rect"
            @mouseenter="onBarEnter(bar)"
            @mouseleave="onBarLeave"
          />
          <text
            :x="bar.x + bar.w / 2"
            :y="(appeared ? bar.y : height) - 6"
            text-anchor="middle"
            class="bar-label"
          >
            {{ formatValue(bar.value) }}
          </text>
        </g>
      </g>
    </svg>

    <div
      v-if="tooltip.show"
      class="tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      <strong>{{ tooltip.value }}</strong>
      <span>{{ tooltip.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.bar-chart-wrap {
  position: relative;
  width: 100%;
}

.bar-chart-wrap :deep(.axis text) {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
}

.bar-rect {
  transition: y var(--duration-chart) var(--ease-out),
              height var(--duration-chart) var(--ease-out);
  cursor: pointer;
}

.bar-rect:hover {
  filter: brightness(1.1);
}

.bar-label {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  transition: y var(--duration-chart) var(--ease-out);
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

.tooltip strong { font-family: var(--font-mono); font-size: var(--text-sm); font-weight: 600; }
.tooltip span { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-muted); }
</style>

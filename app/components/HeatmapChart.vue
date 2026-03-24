<script setup lang="ts">
import * as d3 from 'd3'
import { useElementSize } from '@vueuse/core'
import type { HeatmapCell } from '~/data/analytics'

const props = withDefaults(defineProps<{
  data: HeatmapCell[]
  height?: number
}>(), {
  height: 200,
})

const containerRef = ref<HTMLElement>()
const { width: cw } = useElementSize(containerRef)

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const margin = { top: 4, right: 8, bottom: 24, left: 36 }
const width = computed(() => Math.max(cw.value - margin.left - margin.right, 0))
const height = computed(() => props.height - margin.top - margin.bottom)

const xScale = computed(() =>
  d3.scaleBand<number>()
    .domain(d3.range(24))
    .range([0, width.value])
    .padding(0.08),
)

const yScale = computed(() =>
  d3.scaleBand<number>()
    .domain(d3.range(7))
    .range([0, height.value])
    .padding(0.08),
)

const maxCount = computed(() => d3.max(props.data, d => d.count) ?? 1)

const colorScale = computed(() =>
  d3.scaleSequential()
    .domain([0, maxCount.value])
    .interpolator(d3.interpolateBlues),
)

const cells = computed(() =>
  props.data.map(d => ({
    ...d,
    x: xScale.value(d.hour) ?? 0,
    y: yScale.value(d.day) ?? 0,
    w: xScale.value.bandwidth(),
    h: yScale.value.bandwidth(),
    fill: colorScale.value(d.count),
  })),
)

const hourLabels = computed(() =>
  [0, 3, 6, 9, 12, 15, 18, 21].map(h => ({
    hour: h,
    x: (xScale.value(h) ?? 0) + xScale.value.bandwidth() / 2,
    label: h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`,
  })),
)

const tooltip = reactive({ show: false, x: 0, y: 0, content: '' })

function onCellEnter(cell: (typeof cells.value)[0]) {
  tooltip.show = true
  tooltip.x = cell.x + cell.w / 2 + margin.left
  tooltip.y = cell.y + margin.top - 4
  tooltip.content = `${dayLabels[cell.day]} ${cell.hour}:00 — ${cell.count} sessions`
}

function onCellLeave() {
  tooltip.show = false
}

const appeared = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { appeared.value = true })
})
</script>

<template>
  <div ref="containerRef" class="heatmap-wrap">
    <svg :width="cw" :height="props.height">
      <g :transform="`translate(${margin.left},${margin.top})`">
        <text
          v-for="(label, i) in dayLabels"
          :key="label"
          :x="-6"
          :y="(yScale(i) ?? 0) + yScale.bandwidth() / 2"
          text-anchor="end"
          dominant-baseline="central"
          class="day-label"
        >
          {{ label }}
        </text>

        <text
          v-for="h in hourLabels"
          :key="h.hour"
          :x="h.x"
          :y="height + 16"
          text-anchor="middle"
          class="hour-label"
        >
          {{ h.label }}
        </text>

        <rect
          v-for="cell in cells"
          :key="`${cell.day}-${cell.hour}`"
          :x="cell.x"
          :y="cell.y"
          :width="cell.w"
          :height="cell.h"
          :fill="cell.fill"
          :opacity="appeared ? 1 : 0"
          :rx="2"
          class="heat-cell"
          :style="{ transitionDelay: `${(cell.day * 24 + cell.hour) * 2}ms` }"
          @mouseenter="onCellEnter(cell)"
          @mouseleave="onCellLeave"
        />
      </g>
    </svg>

    <div
      v-if="tooltip.show"
      class="tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      {{ tooltip.content }}
    </div>
  </div>
</template>

<style scoped>
.heatmap-wrap {
  position: relative;
  width: 100%;
}

.day-label,
.hour-label {
  fill: var(--color-text-muted);
  font-size: 10px;
  font-family: 'Inter', system-ui, sans-serif;
}

.heat-cell {
  transition: opacity var(--duration-slow) var(--ease-out);
  cursor: pointer;
}

.heat-cell:hover {
  stroke: var(--color-text);
  stroke-width: 1;
}

.tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-3);
  pointer-events: none;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  z-index: 10;
}
</style>

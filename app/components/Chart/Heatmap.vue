<script setup lang="ts">
import * as d3 from 'd3'
import ChartHeatmapTooltipContent from './HeatmapTooltipContent.vue'
import type { HeatmapCell } from '~/data/analytics'

const props = withDefaults(defineProps<{
  data: HeatmapCell[]
  height?: number
}>(), {
  height: 200,
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const containerRef = ref<HTMLElement>()
const { width: cw } = useElementSize(containerRef)

const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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

// Dark mode: low values fade into the surface background, highs glow in Oxide green.
// Light mode: light to chart-1 green gradient.
const colorScale = computed(() =>
  d3.scaleSequential()
    .domain([0, maxCount.value])
    .interpolator(
      isDark.value
        ? d3.interpolateRgbBasis(['#0e1c1f', '#144030', '#48d597'])
        : d3.interpolateRgbBasis(['#f0fdf9', '#50d4a3']),
    ),
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

const { show: showTip, hide: hideTip } = useTooltip()

function onCellEnter(cell: (typeof cells.value)[0]) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  showTip({
    is: ChartHeatmapTooltipContent,
    props: {
      day: dayLabels[cell.day],
      time: `${cell.hour}:00`,
      value: `${cell.count} sessions`,
      color: cell.fill,
    },
  }, rect.left + cell.x + cell.w / 2 + margin.left, rect.top + cell.y + margin.top - 4)
}

function onCellLeave() {
  hideTip()
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
  font-size: var(--text-xs);
  font-family: var(--font-mono);
}

.heat-cell {
  transition: opacity var(--motion-chart-heatmap);
  cursor: pointer;
}

.heat-cell:hover {
  stroke: var(--color-text);
  stroke-width: 1;
}

</style>

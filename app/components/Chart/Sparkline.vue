<script setup lang="ts">
import * as d3 from 'd3'

const props = withDefaults(defineProps<{
  data: number[]
  color?: string
  width?: number
  height?: number
}>(), {
  color: 'var(--chart-1)',
  width: 100,
  height: 32,
})

const uid = useId()
const gradientId = computed(() => `spark-grad-${uid}`)

const xScale = computed(() =>
  d3.scaleLinear().domain([0, props.data.length - 1]).range([0, props.width]),
)

const yScale = computed(() => {
  const [lo, hi] = d3.extent(props.data) as [number, number]
  const pad = (hi - lo) * 0.15 || 1
  return d3.scaleLinear().domain([lo - pad, hi + pad]).range([props.height, 0])
})

const linePath = computed(() =>
  d3.line<number>()
    .x((_, i) => xScale.value(i))
    .y(d => yScale.value(d))
    .curve(d3.curveMonotoneX)(props.data) ?? '',
)

const areaPath = computed(() =>
  d3.area<number>()
    .x((_, i) => xScale.value(i))
    .y0(props.height)
    .y1(d => yScale.value(d))
    .curve(d3.curveMonotoneX)(props.data) ?? '',
)
</script>

<template>
  <svg :width="width" :height="height" class="sparkline">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
        <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    <path :d="areaPath" :fill="`url(#${gradientId})`" />
    <path :d="linePath" fill="none" :stroke="color" stroke-width="1.5" />
  </svg>
</template>

<style scoped>
.sparkline {
  display: block;
  overflow: visible;
}
</style>

<script setup lang="ts">
import * as d3 from 'd3'

const props = withDefaults(defineProps<{
  data: number[]
  color?: string
  width?: number
  height?: number
  /** When true, animate the line drawing in on mount. */
  animate?: boolean
}>(), {
  color: 'var(--chart-1)',
  width: 100,
  height: 32,
  animate: false,
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

const lineEl = useTemplateRef<SVGPathElement>('lineEl')
const areaEl = useTemplateRef<SVGPathElement>('areaEl')
// Keeps the SVG hidden (via :style) from SSR through hydration so the
// server-rendered paths are never visible before the animation begins.
const ready = ref(false)

onMounted(() => {
  if (!props.animate) {
    ready.value = true
    return
  }

  // Set up the hidden-but-ready animation state while the SVG is still invisible.
  if (lineEl.value) {
    const el = lineEl.value
    const len = el.getTotalLength()
    el.style.strokeDasharray = `${len}`
    el.style.strokeDashoffset = `${len}`
  }
  if (areaEl.value) {
    areaEl.value.style.opacity = '0'
  }

  // Reveal the SVG — elements inside are hidden via dash/opacity inline styles.
  ready.value = true

  // Force reflow so the browser commits the hidden state before transitioning.
  lineEl.value?.getBoundingClientRect()

  requestAnimationFrame(() => {
    if (lineEl.value) {
      const el = lineEl.value
      el.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.strokeDashoffset = '0'
      el.addEventListener('transitionend', () => {
        el.style.transition = ''
        el.style.strokeDasharray = ''
        el.style.strokeDashoffset = ''
      }, { once: true })
    }
    if (areaEl.value) {
      const el = areaEl.value
      el.style.transition = 'opacity 0.6s ease 0.5s'
      el.style.opacity = '1'
    }
  })
})
</script>

<template>
  <svg :width="width" :height="height" class="sparkline" :style="animate && !ready ? { opacity: 0 } : undefined">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
        <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    <path
      ref="areaEl"
      :d="areaPath"
      :fill="`url(#${gradientId})`"
    />
    <path
      ref="lineEl"
      :d="linePath"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
    />
  </svg>
</template>

<style scoped>
.sparkline {
  display: block;
  overflow: visible;
}

</style>

<script setup lang="ts">
import * as d3 from 'd3'

const props = withDefaults(defineProps<{
  data: number[]
  color?: string
  /** Fixed pixel width. Omit to fill the container (self-sizing). */
  width?: number
  height?: number
  /** When true, animate the line drawing in on mount. */
  animate?: boolean
}>(), {
  color: 'var(--chart-1)',
  width: 0,
  height: 32,
  animate: false,
})

const containerRef = ref<HTMLElement>()
const { width: containerWidth } = useElementSize(containerRef)

// Use the explicit prop when provided; otherwise fill the container.
const effectiveWidth = computed(() => props.width || containerWidth.value)

const uid = useId()
const gradientId  = computed(() => `spark-grad-${uid}`)
const animClipId  = computed(() => `spark-anim-clip-${uid}`)

const xScale = computed(() =>
  d3.scaleLinear().domain([0, props.data.length - 1]).range([0, effectiveWidth.value]),
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

// ── Draw-in animation (clipRect, same pattern as ChartLine) ──────────────────
// Animates a clip rect from width=0 → effectiveWidth so strokeDasharray is
// never touched and getTotalLength() timing is not a concern.

const animClipRectEl = ref<SVGRectElement>()
const areasVisible   = ref(false)
const hasAnimated    = ref(false)
let   animRaf        = 0

watch(effectiveWidth, (w) => {
  if (!props.animate || w <= 0) return

  if (hasAnimated.value) {
    animClipRectEl.value?.setAttribute('width', String(w))
    return
  }
  hasAnimated.value = true

  const { duration, easing } = getMotion('--motion-chart-draw')
  const start                = performance.now()

  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)
    animClipRectEl.value?.setAttribute('width', String(w * easing(t)))
    if (t < 1) {
      animRaf = requestAnimationFrame(frame)
    }
    else {
      animRaf = 0
      animClipRectEl.value?.setAttribute('width', String(effectiveWidth.value))
    }
  }

  nextTick(() => {
    animRaf = requestAnimationFrame(frame)
    areasVisible.value = true
  })
}, { immediate: true })

onUnmounted(() => { if (animRaf) cancelAnimationFrame(animRaf) })
</script>

<template>
  <div ref="containerRef" class="sparkline-wrap">
    <svg :width="props.width || '100%'" :height="height" class="sparkline">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
        </linearGradient>
        <clipPath v-if="animate" :id="animClipId">
          <!-- width starts at 0; driven by the RAF loop above -->
          <rect ref="animClipRectEl" width="0" :height="height" />
        </clipPath>
      </defs>

      <path
        :d="areaPath"
        :fill="`url(#${gradientId})`"
        class="area-path"
        :style="animate ? { opacity: areasVisible ? undefined : '0' } : undefined"
      />
      <g :clip-path="animate ? `url(#${animClipId})` : undefined">
        <path
          :d="linePath"
          fill="none"
          :stroke="color"
          stroke-width="1.5"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.sparkline-wrap {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.sparkline {
  display: block;
  overflow: visible;
}

.area-path { transition: opacity var(--motion-chart-area); }
</style>

<script setup lang="ts">
import * as d3 from 'd3'

interface Segment {
  label: string
  value: number
  color: string
}

const props = withDefaults(defineProps<{
  data: Segment[]
  size?: number
  formatCenter?: (total: number) => string
}>(), {
  size: 220,
  formatCenter: (total: number) => total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(total),
})

const outerRadius = computed(() => props.size / 2)
const innerRadius = computed(() => outerRadius.value * 0.62)

const pieLayout = d3.pie<Segment>()
  .value(d => d.value)
  .sort(null)
  .padAngle(0.02)

const arcGen = computed(() =>
  d3.arc<d3.PieArcDatum<Segment>>()
    .innerRadius(innerRadius.value)
    .outerRadius(outerRadius.value)
    .cornerRadius(3),
)

const arcs = computed(() => pieLayout(props.data))

const total = computed(() =>
  props.data.reduce((sum, d) => sum + d.value, 0),
)

const pathRefs = ref<SVGPathElement[]>([])

onMounted(() => {
  requestAnimationFrame(() => {
    pathRefs.value.forEach((pathEl, i) => {
      const arc = arcs.value[i]
      if (!arc || !pathEl) return
      const fn = arcGen.value
      d3.select(pathEl)
        .transition()
        .delay(i * 90)
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attrTween('d', () => {
          const interp = d3.interpolate(arc.startAngle, arc.endAngle)
          return (t: number) => fn({ ...arc, endAngle: interp(t) }) ?? ''
        })
        .styleTween('opacity', () => (t: number) => String(d3.interpolate(0, 1)(t)))
    })
  })
})
</script>

<template>
  <div class="donut-wrap">
    <svg :width="size" :height="size" class="donut-svg">
      <g :transform="`translate(${outerRadius},${outerRadius})`">
        <path
          v-for="(arc, i) in arcs"
          :ref="(el) => { if (el) pathRefs[i] = el as SVGPathElement }"
          :key="i"
          :d="arcGen({ ...arc, endAngle: arc.startAngle }) ?? ''"
          :fill="arc.data.color"
          style="opacity: 0"
          class="arc-path"
        />
        <text text-anchor="middle" dy="-4" class="center-value">
          {{ formatCenter(total) }}
        </text>
        <text text-anchor="middle" dy="14" class="center-label">
          total
        </text>
      </g>
    </svg>

    <ul class="legend">
      <li v-for="seg in data" :key="seg.label" class="legend-item">
        <span class="legend-dot" :style="{ background: seg.color }" />
        <span class="legend-label">{{ seg.label }}</span>
        <span class="legend-value">
          {{ seg.value >= 1024 ? `${(seg.value / 1024).toFixed(1)} TiB` : `${seg.value} GiB` }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex-wrap: wrap;
  justify-content: center;
}

.donut-svg {
  flex-shrink: 0;
}

.arc-path {
  cursor: pointer;
}

.arc-path:hover {
  filter: brightness(1.15);
}

.center-value {
  fill: var(--color-text);
  font-size: var(--text-xl);
  font-weight: 700;
  font-family: var(--font-mono);
}

.center-label {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--font-sans);
}

.legend {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  color: var(--color-text-muted);
  min-width: 100px;
}

.legend-value {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
}
</style>

<script setup lang="ts">
// Mirror ChartLine's constants so heights stay in sync
const CTX_GAP = 10
const CTX_H   = 28
const CTX_BOT = 20
const MARGIN_TOP    = 12
const MARGIN_BOTTOM = 32
const MARGIN_LEFT   = 44

// height = focus chart height prop (same value passed to ChartLine)
// showMinimap = true when ChartLine has fullData (adds CTX_GAP+CTX_H+CTX_BOT = 58px to SVG)
const props = withDefaults(defineProps<{
  height?: number
  showMinimap?: boolean
}>(), { height: 240, showMinimap: false })

// Total SVG height (matches ChartLine's totalSvgHeight)
const svgHeight = computed(() =>
  props.showMinimap
    ? props.height + CTX_GAP + CTX_H + CTX_BOT
    : props.height,
)

// Y-axis ticks only span the focus inner height (same as ChartLine's focusHeight)
const focusInnerHeight = computed(() =>
  props.height - MARGIN_TOP - MARGIN_BOTTOM,
)
</script>

<template>
  <div class="skeleton-line">
    <!-- Top bar: mirrors .chart-top-bar (22px + --space-3 margin-bottom) -->
    <div class="skel-top-bar">
      <div class="skel-legend">
        <div class="skel skel-legend-item" />
        <div class="skel skel-legend-item skel-legend-item-2" />
      </div>
    </div>

    <!-- SVG area: exact height match to ChartLine's totalSvgHeight -->
    <div class="skel-svg-area" :style="{ height: `${svgHeight}px` }">
      <!-- Y-axis: left column, ticks span focusInnerHeight with top/bottom margin -->
      <div
        class="skel-y-axis"
        :style="{
          paddingTop: `${MARGIN_TOP}px`,
          paddingBottom: `${svgHeight - MARGIN_TOP - focusInnerHeight}px`,
          width: `${MARGIN_LEFT}px`,
        }"
      >
        <div class="skel skel-tick" />
        <div class="skel skel-tick skel-tick-2" />
        <div class="skel skel-tick skel-tick-3" />
        <div class="skel skel-tick skel-tick-4" />
        <div class="skel skel-tick skel-tick-5" />
      </div>

      <!-- Chart body: grid lines + context bar -->
      <div class="skel-right">
        <!-- Focus grid lines (span focusInnerHeight with top margin) -->
        <div
          class="skel-grid"
          :style="{
            marginTop: `${MARGIN_TOP}px`,
            height: `${focusInnerHeight}px`,
          }"
        >
          <div class="skel skel-grid-line" />
          <div class="skel skel-grid-line skel-grid-2" />
          <div class="skel skel-grid-line skel-grid-3" />
          <div class="skel skel-grid-line skel-grid-4" />
          <div class="skel skel-grid-line" />
        </div>

        <!-- X-axis label stubs (margin.bottom area) -->
        <div class="skel-x-axis" :style="{ height: `${MARGIN_BOTTOM}px` }">
          <div class="skel skel-x-label" />
          <div class="skel skel-x-label skel-x-wide" />
          <div class="skel skel-x-label" />
          <div class="skel skel-x-label skel-x-wide" />
          <div class="skel skel-x-label" />
        </div>

        <!-- Context/minimap (CTX_GAP + CTX_H + CTX_BOT) -->
        <template v-if="showMinimap">
          <div class="skel-ctx-bar" :style="{ marginTop: `${CTX_GAP}px`, height: `${CTX_H}px` }">
            <div class="skel skel-ctx-inner" />
          </div>
          <div class="skel-x-axis" :style="{ height: `${CTX_BOT}px` }">
            <div class="skel skel-x-label" />
            <div class="skel skel-x-label skel-x-wide" />
            <div class="skel skel-x-label" />
            <div class="skel skel-x-label skel-x-wide" />
            <div class="skel skel-x-label" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-line {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ── Shared pulse ─────────────────────────────────────────── */

.skel {
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  animation: pulse var(--motion-pulse-ui);
}

/* ── Top bar (mirrors .chart-top-bar: 22px + --space-3 margin) */

.skel-top-bar {
  height: 22px;
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.skel-legend {
  display: flex;
  gap: var(--space-3);
}

.skel-legend-item { width: 48px; height: 8px; }
.skel-legend-item-2 { width: 36px; animation-delay: 0.15s; }

/* ── SVG area ─────────────────────────────────────────────── */

.skel-svg-area {
  display: flex;
  flex-shrink: 0;
}

/* ── Y-axis ───────────────────────────────────────────────── */

.skel-y-axis {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  box-sizing: border-box;
}

.skel-tick      { width: 28px; height: 8px; animation-delay: 0.05s; }
.skel-tick-2    { width: 24px; animation-delay: 0.10s; }
.skel-tick-3    { width: 28px; animation-delay: 0.15s; }
.skel-tick-4    { width: 20px; animation-delay: 0.20s; }
.skel-tick-5    { width: 26px; animation-delay: 0.08s; }

/* ── Right column ─────────────────────────────────────────── */

.skel-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── Grid ─────────────────────────────────────────────────── */

.skel-grid {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
}

.skel-grid-line  { width: 100%; height: 1px; }
.skel-grid-2     { animation-delay: 0.05s; }
.skel-grid-3     { animation-delay: 0.10s; }
.skel-grid-4     { animation-delay: 0.08s; }

/* ── X-axis ───────────────────────────────────────────────── */

.skel-x-axis {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.skel-x-label  { width: 28px; height: 8px; animation-delay: 0.12s; }
.skel-x-wide   { width: 38px; animation-delay: 0.20s; }

/* ── Context/minimap bar ──────────────────────────────────── */

.skel-ctx-bar {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
}

.skel-ctx-inner {
  flex: 1;
  border-radius: var(--radius-sm);
  animation-delay: 0.06s;
}

</style>
